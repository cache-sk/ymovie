/// <reference path="../type/Catalogue.ts"/>
/// <reference path="../type/Media.ts"/>

namespace ymovie.api.Scc {
	import Catalogue = type.Catalogue;
	import Media = type.Media;

	export class Api {
		static ENDPOINT = "https://plugin.sc2.zone";
		static PATH_SEARCH = "/api/media/filter/search?order=desc&sort=score&type=*";

		static PATH_MOVIES = "/api/media/filter/news?type=movie&sort=dateAdded&order=desc&days=365";
		static PATH_SERIES = "/api/media/filter/news?type=tvshow&sort=dateAdded&order=desc&days=365";
		static PATH_CONCERTS = "/api/media/filter/concert?type=*&sort=dateAdded&order=desc&days=730";
		static PATH_FAIRY_TALES = "/api/media/filter/genre?type=movie&sort=premiered&order=desc&value=Fairy Tale";
		static PATH_ANIMATED_MOVIES = "/api/media/filter/genre?type=movie&sort=premiered&order=desc&days=365&value=Animated";
		static PATH_ANIMATED_SERIES = "/api/media/filter/genre?type=tvshow&sort=premiered&order=desc&days=365&value=Animated";
		static PATH_MOVIES_CZSK = "/api/media/filter/newsDubbed?type=movie&sort=langDateAdded&order=desc&lang=cs&lang=sk&days=730";
		static PATH_SERIES_CZSK = "/api/media/filter/newsDubbed?type=tvshow&sort=langDateAdded&order=desc&lang=cs&lang=sk&days=730";
		static PATH_POPULAR_MOVIES = "/api/media/filter/all?type=movie&sort=playCount&order=desc";
		static PATH_POPULAR_SERIES = "/api/media/filter/all?type=tvshow&sort=playCount&order=desc";
		static PATH_MOVIES_ADDED = "/api/media/filter/all?type=movie&sort=dateAdded&order=desc";
		static PATH_SERIES_ADDED = "/api/media/filter/all?type=tvshow&sort=dateAdded&order=desc";

		static TOKEN_PARAM_NAME = "access_token"
		static TOKEN_PARAM_VALUE = "th2tdy0no8v1zoh1fs59";

		private uuid:string;

		constructor(uuid:string){
			this.uuid = uuid;
		}

		async search(query:string){
			return await this.loadPath(`${Api.PATH_SEARCH}&value=${encodeURIComponent(query)}`);
		}
		
		async loadPath(path:string){
			return await this.loadUrl(`${Api.ENDPOINT}${path}`);
		}
		
		async loadIds(ids:Array<string>){
			const query = ids.reduce((a, c) => a + "&id=" + encodeURIComponent(c), "");
			return await this.loadPath(`/api/media/filter/ids?${query}`);
		}
		
		async loadMedia(id:string){
			return await this.loadPath(`/api/media/${id}`);
		}
		
		async loadStreams(id:string){
			return await this.loadPath(`/api/media/${id}/streams`);
		}
		
		async loadSeasons(id:string){
			return await this.loadPath(`/api/media/filter/parent?value=${id}&sort=episode`);
		}
		
		async loadEpisodes(id:string){
			return await this.loadPath(`/api/media/filter/parent?value=${id}&sort=episode`);
		}
		
		async loadUrl(url:string){
			const headers = {"X-Uuid":this.uuid};
			const finalUrl = this.appendAccessToken(url);
			return await (await fetch(finalUrl, {headers})).json();
		}
		
		appendAccessToken(url:string){
			const name = Api.TOKEN_PARAM_NAME;
			const value = Api.TOKEN_PARAM_VALUE;
			if(url.indexOf(`&${name}=`) != -1 || url.indexOf(`?${name}=`) != -1)
				return url;
			return url + (url.indexOf("?") != -1 ? "&" : "?") + `${name}=${value}`;
		}
	}

	export class Parser {
		static toStreams(source:StreamsResponse):Array<Media.Stream> {
			const streams:Array<Media.Stream | undefined> = source.map(item => this.normalizeStream(item));
			return <Array<Media.Stream>>streams.filter(item => item != undefined);
		}

		static toCatalogue(data:Response, title:string):Array<Catalogue.AnyItem> {
			const result:Array<Catalogue.AnyItem> = <Array<Catalogue.AnyItem>>data.data
				.map(item => this.toItem(item))
				.filter(item => item != undefined);
			const page = data?.pagination;
			if(page?.prev)
				result.unshift(new CatalogueLink("folder", title, page.prev, `${page.page - 1}/${page.pageCount}`, page.page - 1))
			if(page?.next)
				result.push(new CatalogueLink("folder", title, page.next, `${page.page + 1}/${page.pageCount}`, page.page + 1));
			return result;
		}
		
		static idsToCatalogue(data:Response, ids:Array<string>, title:string):Array<Catalogue.AnyItem> {
			const normalized = this.toCatalogue(data, title);
			const result = [];
			for(const id of ids){
				const item = normalized.find((item:Catalogue.AnyItem) => (<Media.Base>item).id === id);
				if(item)
					result.push(item);
			}
			
			return result;
		}

		static toItem(item:Item):Media.Scc | undefined {
			const id = item._id;
			const source = item._source;
			const info = source.info_labels;
			const info2 = source.info2 = this.mergeI18n(source.i18n_info_labels);
			let result:Media.Scc;
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
		
		private static normalizePlayable(source:Source, result:Media.PlayableScc):void {
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
		
		private static normalizeRating(source:Source, result:Media.Base):void {
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
		
		private static normalizeLanguage(source:Source, result:Media.Scc):void {
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
		
		private static normalizeMovie(id:string, source:Source):Media.Movie {
			const result = new Media.Movie(id);
			this.normalizePlayable(source, result);
			return result;
		}
		
		private static normalizeSeries(id:string):Media.Series {
			return new Media.Series(id);
		}
		
		private static normalizeSeason(id:string, source:Source):Media.Season {
			const result = new Media.Season(id);
			result.seriesId = this.normalizeRootId(source);
			result.seriesTitle = this.normalizeRootTitle(source);
			result.seasonNumber = source.info_labels.season;
			result.longTitle = `${result.seriesTitle} - Season ${result.seasonNumber}`;
			return result;
		}
		
		private static normalizeEpisode(id:string, source:Source):Media.Episode {
			const result = new Media.Episode(id);
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
		
		private static normalizeStream(source:Stream):Media.Stream | undefined {
			if(!source.video || !source.video.length)
				return undefined;
			const video = <VideoStream>source.video[0];
			const result:Media.Stream = {
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

	export class CatalogueLink extends Catalogue.Base {
		readonly url:string;
		readonly subtitle?:string;
		readonly page?:number;

		constructor(group:Catalogue.ItemType, label:string, url:string, subtitle?:string, page?:number) {
			super(group, label);
			this.url = url;
			this.subtitle = subtitle;
			this.page = page;
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

	type Services = {
		csfd?:number;
		imdb?:number;
		trakt?:number;
		tmdb?:number;
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