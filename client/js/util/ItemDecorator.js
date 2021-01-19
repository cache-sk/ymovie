/**
Item
	id:String = "ae15"
	poster:String = "http://xyz..."
	type:Number = CatalogueItemType.SCC_MOVIE
	*title:String = "Avatar";
	*year:Numer = 2020
	*rating:Number = 7.1
	*isCZSK:Bool;

Playable extends Common
	*plot:String = "Abc. Def."
	*trailers:Array<String> = ["http://xyz..."]
	*mpaa:Number = 12
	*studio:String = "Romulus"
	*services:Services
	*streamCount:Number = 12
	*originalTitle:String = "Abc"
	*genres:String = "Comedy, Drama"
	*directors:String = "A, B, C";
	*cast:String = "A, B, C";

Movie extends Playable

Series extends Item

Season extends Item
	*seriesTitle:String = "Simsons"
	*seasonNumber:Number = 2
	
Episode extends Playable
	*seriesTitle:String = "Simsons"
	*seasonNumber:Number = 4
	*episodeNumber:Number = 3

Services
	*csfd:Number = 787059
	*imdb:Number = 6285944
	*trakt:Number = 473980
	*tmdb:Number = 456

 */

class ItemDecorator {
	static create(source){
		return new this(source);
	}
	
	constructor(source){
		this.source = source;
	}
	
	get id(){
		return this.source.id;
	}
	
	get title(){
		return this.source.title;
	}
	
	get subtitle(){
		return this.isSccEpisode ? `Season ${this.seasonNumber}, Episode ${this.episodeNumber}` : null;
	}
	
	get seriesId(){
		return this.source.seriesId;
	}
	
	get seriesTitle(){
		return this.source.seriesTitle;
	}
	
	get longTitle(){
		if(this.isSccEpisode)
			return `${this.seriesTitle} - Season ${this.seasonNumber} - Episode ${this.episodeNumber}`;
		if(this.isSccSeason)
			return `${this.seriesTitle} - Season ${this.seasonNumber}`;
		return this.title;
	}
	
	get year(){
		return (this.source.year || "") + "";
	}
	
	get rating(){
		if(this.source?.hasOwnProperty("ratingPositive") && this.source?.hasOwnProperty("ratingNegative"))
			return (this.source.ratingPositive + this.source.ratingNegative) 
				? `${this.source.ratingPositive}:${this.source.ratingNegative}`
				: "";
		return this.source?.rating?.toFixed(1) || "";
	}
	
	get type(){
		return this.source.type;
	}
	
	get streamCount(){
		return this.source.streamCount;
	}
	
	get isPlayable(){
		if(this.isWebshareVideo)
			return true;
		return this.streamCount > 0 && (this.isSccMovie || this.isSccEpisode);
	}
	
	get plot(){
		return this.source?.plot || "";
	}
	
	get originalTitle(){
		return this.source?.originalTitle || "";
	}
	
	get inlineGenres(){
		return this.source.genres;
	}
	
	get inlineDirectors(){
		return this.source.directors;
	}
	
	get inlineCast(){
		return this.source.cast;
	}
	
	get mpaa(){
		return this.source.mpaa;
	}
	
	get studio(){
		return this.source.studio;
	}
	
	get services(){
		return this.source.services;
	}
	
	get trailers(){
		return this.source.trailers;
	}
	
	get episodeNumber(){
		return this.source.episodeNumber;
	}
	
	get seasonNumber(){
		return this.source.seasonNumber;
	}
	
	get poster(){
		return this.source.poster;
	}
	
	get size(){
		return this.source.size;
	}
	
	get posterThumbnail(){
		const original = this.poster;
		if(!original)
			return null;
			
		let url = original.replace("http://", "https://");
		// https://www.themoviedb.org/talk/53c11d4ec3a3684cf4006400
		// http://image.tmdb.org/t/p/original/4W24saRPKCJIwsvrf76zmV6FlsD.jpg
		if(url.indexOf("image.tmdb.org") > -1)
			return url.replace("/original/", "/w342/");
		// https://img.csfd.cz/files/images/film/posters/159/449/159449928_d6eea3.png
		// w180, h180, w600h800
		if(url.indexOf("img.csfd.cz") > -1)
			return `${url}?w180`;
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
	
	get formatSize(){
		if(!this.size)
			return null;
		const mb = this.size / 1024 / 1024;
		return mb > 100 ? (mb / 1024).toFixed(1) + "G" : mb.toFixed(1) + "M";
	}
	
	get isCZSK(){
		return this.source.isCZSK;
	}
	
	get isSccMovie(){
		return this.source.type === CatalogueItemType.SCC_MOVIE;
	}
	
	get isSccSeries(){
		return this.source.type === CatalogueItemType.SCC_SERIES;
	}

	get isSccSeason(){
		return this.source.type === CatalogueItemType.SCC_SEASON;
	}
	
	get isSccEpisode(){
		return this.source.type === CatalogueItemType.SCC_EPISODE;
	}
	
	get isWebshareVideo(){
		return this.source.type === CatalogueItemType.WEBSHARE_VIDEO;
	}
}
