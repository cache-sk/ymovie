namespace ymovie.util {
	export class CastUtil {
		static toCastInfo(data:type.Type.PlayableStream):chrome.cast.media.IMetadata {
			const decorator = ItemDecorator.create(data.source);
			const poster = decorator.posterThumbnail;
			const result = new chrome.cast.media.MediaInfo(<string>data.url, 'video/mp4');
			result.metadata = data.source instanceof type.Type.Episode
				? this.toCastSeriesMetadata(decorator) 
				: this.toCastMovieMetadata(decorator);
			if(poster)
				result.metadata.images = [{url:poster}];
			return result;
		}
		
		private static toCastSeriesMetadata(decorator:ItemDecorator):chrome.cast.media.TvShowMediaMetadata {
			const result = new chrome.cast.media.TvShowMediaMetadata();
			result.episode = decorator.episodeNumber;
			result.originalAirdate = decorator.year;
			result.season = decorator.seasonNumber;
			result.seriesTitle = decorator.seriesTitle;
			result.title = decorator.source.title;
			return result;
		}
		
		private static toCastMovieMetadata(decorator:ItemDecorator):chrome.cast.media.MovieMediaMetadata {
			const result = new chrome.cast.media.MovieMediaMetadata();
			result.title = decorator.source.title;
			result.studio = decorator.studio;
			result.releaseDate = decorator.year;
			return result;
		}
	}
}
