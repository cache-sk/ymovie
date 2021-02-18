namespace ymovie.util {
	export class CastUtil {
		static toCastInfo(data:type.Type.PlayableStream):chrome.cast.media.IMetadata {
			const poster = (data.source instanceof type.Type.PlayableSccItem && data.source.posterThumbnail) || data.source.poster;
			const result = new chrome.cast.media.MediaInfo(<string>data.url, 'video/mp4');
			if(data.source instanceof type.Type.Episode)
				result.metadata = this.toCastSeriesMetadata(data.source) 
			else if(data.source instanceof type.Type.Movie)
				result.metadata = this.toCastMovieMetadata(data.source);
			if(result.metadata && poster)
				result.metadata.images = [{url:poster}];
			return result;
		}
		
		private static toCastSeriesMetadata(data:type.Type.Episode):chrome.cast.media.TvShowMediaMetadata {
			const result = new chrome.cast.media.TvShowMediaMetadata();
			result.episode = data.episodeNumber;
			result.originalAirdate = data.year;
			result.season = data.seasonNumber;
			result.seriesTitle = data.seriesTitle;
			result.title = data.title;
			return result;
		}
		
		private static toCastMovieMetadata(data:type.Type.Movie):chrome.cast.media.MovieMediaMetadata {
			const result = new chrome.cast.media.MovieMediaMetadata();
			result.title = data.title;
			result.studio = data.studio;
			result.releaseDate = data.year;
			return result;
		}
	}
}
