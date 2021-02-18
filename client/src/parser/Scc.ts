namespace ymovie.parser {
	export class Scc {
		static toStreams(source:StreamsResponse):Array<type.Media.Stream> {
			const streams:Array<type.Media.Stream | undefined> = source.map(item => this.normalizeStream(item));
			return <Array<type.Media.Stream>>streams.filter(item => item != undefined);
		}

		static toCatalogue(data:Response, title:string):Array<type.Catalogue.AnyItem> {
			const result:Array<type.Catalogue.AnyItem> = <Array<type.Catalogue.AnyItem>>data.data
				.map(item => this.toItem(item))
				.filter(item => item != undefined);
			const page = data?.pagination;
			if(page?.prev)
				result.unshift(util.CatalogueUtil.createSccLink("folder", title, page.prev, `${page.page - 1}/${page.pageCount}`, page.page - 1))
			if(page?.next)
				result.push(util.CatalogueUtil.createSccLink("folder", title, page.next, `${page.page + 1}/${page.pageCount}`, page.page + 1));
			return result;
		}
		
		static idsToCatalogue(data:Response, ids:Array<string>, title:string):Array<type.Catalogue.AnyItem> {
			const normalized = this.toCatalogue(data, title);
			const result = [];
			for(const id of ids){
				const item = normalized.find((item:type.Catalogue.AnyItem) => (<type.Media.Base>item).id === id);
				if(item)
					result.push(item);
			}
				
			return result;
		}

		static toItem(item:Item):type.Media.Scc | undefined {
			const id = item._id;
			const source = item._source;
			const info = source.info_labels;
			const info2 = source.info2 = this.mergeI18n(source.i18n_info_labels);
			let result:type.Media.Scc;
			if(info.mediatype === "movie")
				result = this.normalizeMovie(id, source);
			else if(info.mediatype === "tvshow")
				result = this.normalizeSeries(id);
			else if(info.mediatype === "season")
				result = this.normalizeSeason(id, source);
			else if(info.mediatype === "episode")
				result = this.normalizeEpisode(id, source);
			else
				return undefined;
			
			result.poster = this.resolvePoster(source.i18n_info_labels);
			result.posterThumbnail = this.resolvePorterThumbnail(result.poster);
			if(info2.title) result.title = info2.title;
			if(!result.longTitle) result.longTitle = result.title;
			if(info.year) result.year = (info.year + "") || undefined;
			this.normalizeRating(source, result);
			this.normalizeLanguage(source, result);
			return result;
		}
		
		private static mergeI18n(list:Array<I18>):Info2 {
			const result:any = {};
			list.forEach(item => {
				Object.keys(item).forEach(key => {
					if(!result[key])
						result[key] = (<any>item)[key];
				})
			})
			return <Info2>result;
		}
		
		private static resolvePoster(list:Array<I18>):string | undefined {
			const missing = /^https:\/\/img.csfd.cz\/assets\/b[0-9]+\/images\/poster-free\.png$/;
			for(const info of list){
				const url = info?.art?.poster;
				if(url && !url?.match(missing))
					return url;
			}
			return undefined;
		}

		private static resolvePorterThumbnail(original:string | undefined):string | undefined {
			if(!original)
				return undefined;
				
			let url = original.replace("http://", "https://");
			// https://www.themoviedb.org/talk/53c11d4ec3a3684cf4006400
			// http://image.tmdb.org/t/p/original/4W24saRPKCJIwsvrf76zmV6FlsD.jpg
			if(url.indexOf("image.tmdb.org") > -1)
				return url.replace("/original/", "/w342/");
			// https://img.csfd.cz/files/images/film/posters/158/066/158066908_cf9118.jpg
			// to https://image.pmgstatic.com/cache/resized/w180/files/images/film/posters/158/066/158066908_cf9118.jpg
			if(url.indexOf("img.csfd.cz") > -1)
				return url.replace("//img.csfd.cz", "//image.pmgstatic.com/cache/resized/w180");
			// https://thetvdb.com/banners/series/375903/posters/5e86c5d2a7fcb.jpg
			// to https://thetvdb.com/banners/series/375903/posters/5e86c5d2a7fcb_t.jpg
			// https://thetvdb.com/banners/posters/71470-2.jpg
			// to // https://thetvdb.com/banners/posters/71470-2_t.jpg
			if(url.indexOf("thetvdb.com") > -1)
				return url.replace(/^(?!.+_t)(.+)(\.[a-z]+)$/, "$1_t$2");
			// https://assets.fanart.tv/fanart/movies/13475/movieposter/star-trek-54d39f41a8ab8.jpg
			// to https://fanart.tv/detailpreview/fanart/movies/13475/movieposter/star-trek-54d39f41a8ab8.jpg
			if(url.indexOf("assets.fanart.tv") > -1)
				return url.replace("assets.fanart.tv", "fanart.tv/detailpreview");
			return url;
		}
		
		private static normalizePlayable(source:Source, result:type.Media.PlayableScc):void {
			const info = source.info_labels;
			const info2 = source.info2;
			const trailers = source.i18n_info_labels.map(item => item.trailer).filter(item => !!item);
			if(info2.plot) result.plot = info2.plot;
			if(trailers.length) result.trailers = trailers;
			if(info.mpaa) result.mpaa = info.mpaa;
			if(info.studio) result.studio = info.studio.constructor === Array ? info.studio.join(", ") : <string>info.studio;
			if(source.services) result.services = source.services;
			if(source?.available_streams?.count) result.streamCount = source.available_streams.count;
			if(info.originaltitle) result.originalTitle = info.originaltitle;
			if(info.genre?.length) result.genres = info.genre.join(", ");
			if(info.director?.length) result.directors = info.director.join(", ");
			if(source.cast?.length) result.cast = source.cast.map(item => item.name).join(", ");
		}
		
		private static normalizeRating(source:Source, result:type.Media.Base):void {
			if(!source?.ratings)
				return;
			var count = 0;
			var rating = 0;
			for (const key in source.ratings) {
				rating += source.ratings[key].rating;
				count++;
			}
			if(count > 0)
				result.rating = (rating / count).toFixed(1);
		}
		
		private static normalizeLanguage(source:Source, result:type.Media.Scc):void {
			const stream = source?.stream_info;
			const streams = source?.available_streams;
			if(stream?.audio?.language == "cs"
				|| stream?.audio?.language == "sk"
				|| stream?.subtitles?.language == "cs"
				|| stream?.subtitles?.language == "sk"
				|| streams?.languages?.audio?.items?.find(item => item.lang == "cs" || item.lang == "sk")
				|| streams?.languages?.subtitles?.items?.find(item => item.lang == "cs" || item.lang == "sk"))
				result.isCZSK = true;
		}
		
		private static normalizeMovie(id:string, source:Source):type.Media.Movie {
			const result = new type.Media.Movie(id);
			this.normalizePlayable(source, result);
			return result;
		}
		
		private static normalizeSeries(id:string):type.Media.Series {
			return new type.Media.Series(id);
		}
		
		private static normalizeSeason(id:string, source:Source):type.Media.Season {
			const result = new type.Media.Season(id);
			result.seriesId = this.normalizeRootId(source);
			result.seriesTitle = this.normalizeRootTitle(source);
			result.seasonNumber = source.info_labels.season;
			result.longTitle = `${result.seriesTitle} - Season ${result.seasonNumber}`;
			return result;
		}
		
		private static normalizeEpisode(id:string, source:Source):type.Media.Episode {
			const result = new type.Media.Episode(id);
			this.normalizePlayable(source, result);
			result.seriesId = this.normalizeRootId(source);
			result.seriesTitle = this.normalizeRootTitle(source);
			result.seasonNumber = source.info_labels.season;
			result.episodeNumber = source.info_labels.episode;
			result.subtitle = `Season ${result.seasonNumber}, Episode ${result.episodeNumber}`;
			result.longTitle = `${result.seriesTitle} - Season ${result.seasonNumber} - Episode ${result.episodeNumber}`;
			return result;
		}
		
		private static normalizeRootTitle(source:Source):string {
			return source.i18n_info_labels
					.find(item => item?.parent_titles?.[0])?.parent_titles?.[0]
				|| source?.root_info_labels?.originaltitle
				|| "(?) " + source?.root_parent;
		}
		
		private static normalizeRootId(source:Source):string {
			return source?.root_parent;
		}
		
		private static normalizeStream(source:Stream):type.Media.Stream | undefined {
			if(!source.video || !source.video.length)
				return undefined;
			const video = <VideoStream>source.video[0];
			const result:type.Media.Stream = {
				size: source.size,
				language: source.audio
					?.map(item => item.language.toUpperCase() || "?")
					?.filter((value, index, self) => self.indexOf(value) === index)
					?.sort()
					?.join("/"),
				subtitles: source.subtitles
					?.map(item => item.language.toUpperCase() || "?")
					?.filter((value, index, self) => self.indexOf(value) === index)
					?.sort()
					?.join("/"),
				width: video.width,
				height: video.height,
				videoCodec: source.video
					?.map(item => item.codec)
					?.filter((value, index, self) => self.indexOf(value) === index)
					?.join("/"),
				audioCodec: source.audio
					?.map(item => item.codec)
					?.filter((value, index, self) => self.indexOf(value) === index)
					?.join("/"),
				duration: video.duration,
				ident: source.ident
			};
			result.hdr = !!source.video.find((item:VideoStream) => item.hdr);
			result.is3d = !!source.video.find((item:VideoStream) => (<any>item)['3d']);
			return result;
		}
	}

	type Response = {
		data:Array<Item>;
		pagination?:Pagination;
	}

	type Pagination = {
		page:number;
		prev?:string;
		next?:string;
		pageCount:number;
	}

	type Item = {
		_id:string;
		_source:Source;
	}

	type Source = {
		info_labels:Info;
		i18n_info_labels:Array<I18>;
		info2:Info2; // created during normalization
		services:Services;
		available_streams?:AvailableStreams;
		cast?:Array<Person>;
		root_info_labels:RootInfo;
		root_parent:string;
		ratings?:any;
		stream_info?:StreamInfo;
	}

	export type Services = {
		csfd?:number; // = 787059
		imdb?:number; // = 6285944
		trakt?:number; // = 473980
		tmdb?:number; // = 456
	}

	type Info = {
		year:number;
		mediatype:"movie" | "tvshow" | "season" | "episode";
		season:number;
		mpaa:number;
		studio:Array<string> | string;
		originaltitle:string;
		genre?:Array<string>;
		director?:Array<string>;
		episode:number;
	}

	type StreamInfo = {
		audio?:Audio;
		subtitles?:Subtitles;
	}

	type Audio = {
		language:string;
	}

	type Subtitles = {
		language:string;
	}

	type RootInfo = {
		originaltitle:string;
	}

	type Info2 = {
		title:string;
		plot:string;
	}

	type I18 = {
		parent_titles:Array<string>;
		trailer:string;
		art?:Art;
	}

	type Art = {
		poster?:string;
	}

	type AvailableStreams = {
		count?:number;
		languages?:AvailableStreamsLanguages;
	}

	type AvailableStreamsLanguages = {
		audio?:{items?:Array<{lang:string}>};
		subtitles?:{items?:Array<{lang:string}>};
	}

	type Person = {
		name:string;
	}

	type StreamsResponse = Array<Stream>;

	type Stream = {
		video?:Array<VideoStream>;
		audio?:Array<AudioStream>;
		subtitles?:Array<SubtitlesStream>;
		size:number;
		ident:string;
	}

	type VideoStream = {
		width:number;
		height:number;
		codec:string;
		duration:number;
		hdr:boolean;
	}

	type AudioStream = {
		language:string;
		codec:string;
	}

	type SubtitlesStream = {
		language:string;
	}
}
