class CastUtil {
	static toCastInfo(data){
		const decorator = ItemDecorator.create(data.source);
		const poster = decorator.posterThumbnail;
		const result = new chrome.cast.media.MediaInfo(data.url, 'video/mp4');
		result.metadata = decorator.isSccEpisode
			? this.toCastSeriesMetadata(decorator) 
			: this.toCastMovieMetadata(decorator);
		if(poster)
			result.metadata.images = [{url:poster}];
		return result;
	}
	
	static toCastSeriesMetadata(decorator){
		const result = new chrome.cast.media.TvShowMediaMetadata();
		result.episode = decorator.episodeNumber;
		result.originalAirdate = decorator.year;
		result.season = decorator.seasonNumber;
		result.seriesTitle = decorator.seriesTitle;
		result.title = decorator.title;
		return result;
	}
	
	static toCastMovieMetadata(decorator){
		const result = new chrome.cast.media.MovieMediaMetadata();
		result.title = decorator.title;
		result.studio = decorator.studio;
		result.releaseDate = decorator.year;
		return result;
	}
}
