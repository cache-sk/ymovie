namespace ymovie.util {
	export class SccUtil {
		static normalizeResponse(data:Response, title:string):Array<type.Type.AnyCatalogueItem> {
			const result:Array<type.Type.AnyCatalogueItem> = data.data.map(item => this.normalizeItem(item));
			const page = data?.pagination;
			if(page?.prev)
				result.unshift(CatalogueUtil.createSccLink("folder", title, page.prev, `${page.page - 1}/${page.pageCount}`, page.page - 1))
			if(page?.next)
				result.push(CatalogueUtil.createSccLink("folder", title, page.next, `${page.page + 1}/${page.pageCount}`, page.page + 1));
			return result;
		}
		
		static normalizeIdsResponse(data:Response, ids:Array<string>, title:string):Array<type.Type.AnyCatalogueItem> {
			const normalized = this.normalizeResponse(data, title);
			const result = [];
			for(const id of ids){
				const item = normalized.find((item:type.Type.AnyCatalogueItem) => (<type.Type.Item>item).id === id);
				if(item)
					result.push(item);
			}
				
			return result;
		}
		
		static mergeI18n(list:Array<I18>):Info2 {
			const result:any = {};
			list.forEach(item => {
				Object.keys(item).forEach(key => {
					if(!result[key])
						result[key] = (<any>item)[key];
				})
			})
			return <Info2>result;
		}
		
		static resolvePoster(list:Array<I18>):string | undefined {
			const missing = /^https:\/\/img.csfd.cz\/assets\/b[0-9]+\/images\/poster-free\.png$/;
			for(const info of list){
				const url = info?.art?.poster;
				if(url && !url?.match(missing))
					return url;
			}
			return undefined;
		}
		
		static normalizeItem(item:Item):type.Type.Item {
			const source = item._source;
			const info = source.info_labels;
			const info2 = source.info2 = this.mergeI18n(source.i18n_info_labels);
			const result:type.Type.Item = <type.Type.Item>{id:item._id, poster:this.resolvePoster(source.i18n_info_labels)};
			if(info2.title) result.title = info2.title;
			if(info.year) result.year = info.year;
			this.normalizeRating(source, result);
			this.normalizeLanguage(source, result);
			if(info.mediatype === "movie") this.normalizeMovie(source, <type.Type.Playable>result);
			if(info.mediatype === "tvshow") this.normalizeSeries(result);
			if(info.mediatype === "season") this.normalizeSeason(source, result);
			if(info.mediatype === "episode") this.normalizeEpisode(source, <type.Type.Episode>result);
			return result;
		}
		
		static normalizePlayable(source:Source, result:type.Type.Playable):void {
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
		
		static normalizeRating(source:Source, result:type.Type.Item):void {
			if(!source?.ratings)
				return;
			var count = 0;
			var rating = 0;
			for (const key in source.ratings) {
				rating += source.ratings[key].rating;
				count++;
			}
			if(count > 0)
				result.rating = rating / count;
		}
		
		static normalizeLanguage(source:Source, result:type.Type.Item):void {
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
		
		static normalizeMovie(source:Source, result:type.Type.Movie):void {
			result.type = type.Type.CatalogueItemType.SCC_MOVIE;
			this.normalizePlayable(source, result);
		}
		
		static normalizeSeries(result:type.Type.Series):void {
			result.type = type.Type.CatalogueItemType.SCC_SERIES;
		}
		
		static normalizeSeason(source:Source, result:type.Type.Season):void {
			result.type = type.Type.CatalogueItemType.SCC_SEASON;
			result.seriesId = this.normalizeRootId(source);
			result.seriesTitle = this.normalizeRootTitle(source);
			result.seasonNumber = source.info_labels.season;
		}
		
		static normalizeEpisode(source:Source, result:type.Type.Episode):void {
			result.type = type.Type.CatalogueItemType.SCC_EPISODE;
			this.normalizePlayable(source, result);
			result.seriesId = this.normalizeRootId(source);
			result.seriesTitle = this.normalizeRootTitle(source);
			result.seasonNumber = source.info_labels.season;
			result.episodeNumber = source.info_labels.episode;
		}
		
		static normalizeRootTitle(source:Source):string {
			return source.i18n_info_labels
					.find(item => item?.parent_titles?.[0])?.parent_titles?.[0]
				|| source?.root_info_labels?.originaltitle
				|| "(?) " + source?.root_parent;
		}
		
		static normalizeRootId(source:Source):string {
			return source?.root_parent;
		}
		
		static normalizeStreams(source:StreamsResponse):Array<type.Type.Stream> {
			const streams:Array<type.Type.Stream | undefined> = source.map(item => this.normalizeStream(item));
			return <Array<type.Type.Stream>>streams.filter(item => item != undefined);
		}
		
		static normalizeStream(source:Stream):type.Type.Stream | undefined {
			if(!source.video || !source.video.length)
				return undefined;
			const video = <VideoStream>source.video[0];
			const result:type.Type.Stream = {
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
		services:type.Type.Services;
		available_streams?:AvailableStreams;
		cast?:Array<Person>;
		root_info_labels:RootInfo;
		root_parent:string;
		ratings?:any;
		stream_info?:StreamInfo;
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
