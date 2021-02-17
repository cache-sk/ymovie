namespace ymovie.util {
	export class ItemDecorator {
		readonly source:type.Type.Item;

		static create(source:type.Type.Item):ItemDecorator {
			return new this(source);
		}
		
		constructor(source:type.Type.Item){
			this.source = source;
		}
		
		get subtitle():string | undefined {
			return this.source instanceof type.Type.Episode ? `Season ${this.seasonNumber}, Episode ${this.episodeNumber}` : undefined;
		}
		
		get seriesId():string | undefined {
			return (<type.Type.Season>this.source).seriesId;
		}
		
		get seriesTitle():string | undefined {
			return (<type.Type.Season>this.source).seriesTitle;
		}
		
		get longTitle():string {
			if(this.source instanceof type.Type.Episode)
				return `${this.seriesTitle} - Season ${this.seasonNumber} - Episode ${this.episodeNumber}`;
			if(this.source instanceof type.Type.Season)
				return `${this.seriesTitle} - Season ${this.seasonNumber}`;
			return <string>this.source.title;
		}
		
		get year():string {
			return (this.source.year || "") + "";
		}
		
		get rating():string {
			const webshare = <type.Type.WebshareItem>this.source;
			if(webshare.ratingPositive || webshare.ratingNegative)
				return `${webshare.ratingPositive || 0}:${webshare.ratingNegative || 0}`;
			return this.source?.rating?.toFixed(1) || "";
		}

		get streamCount():number | undefined {
			return (<type.Type.Playable>this.source).streamCount;
		}
		
		get isPlayable():boolean {
			if(this.source instanceof type.Type.WebshareItem)
				return true;
			if(!this.streamCount)
				return false;
			return this.source instanceof type.Type.Movie || this.source instanceof type.Type.Episode;
		}
		
		get plot():string {
			return (<type.Type.Playable>this.source)?.plot || "";
		}
		
		get originalTitle():string {
			return (<type.Type.Playable>this.source)?.originalTitle || "";
		}
		
		get inlineGenres():string | undefined {
			return (<type.Type.Playable>this.source).genres;
		}
		
		get inlineDirectors():string | undefined {
			return (<type.Type.Playable>this.source).directors;
		}
		
		get inlineCast():string | undefined {
			return (<type.Type.Playable>this.source).cast;
		}
		
		get mpaa():number | undefined {
			return (<type.Type.Playable>this.source).mpaa;
		}
		
		get studio():string | undefined {
			return (<type.Type.Playable>this.source).studio;
		}
		
		get services():type.Type.Services | undefined {
			return (<type.Type.Playable>this.source).services;
		}
		
		get trailers():Array<string> | undefined {
			return (<type.Type.Playable>this.source).trailers;
		}
		
		get episodeNumber():number | undefined {
			return (<type.Type.Episode>this.source).episodeNumber;
		}
		
		get seasonNumber():number | undefined {
			return (<type.Type.Episode>this.source).seasonNumber;
		}
		
		get posterThumbnail():string | undefined {
			const original = this.source.poster;
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
	}
}
