namespace ymovie.api {
	/**
	 * Cast sender is tricky to work on localhost (http, https), filesystem or secured domain (https).
	 * For that reason the app should be only served from https.
	 */
	export class ApiCast {
		onStatus:(available:boolean) => void;
		session:chrome.cast.Session | undefined;

		constructor(onStatus:(available:boolean) => void){
			this.onStatus = onStatus;
		}
		
		init(){
			if(window?.chrome && chrome.cast)
				this.initApi();
			else
				(<any>window)['__onGCastApiAvailable'] = this.onCastApiAvailable.bind(this);
		}
		
		initApi(){
			const config = new chrome.cast.ApiConfig(this.createSessionRequest(), 
				this.onSession.bind(this), this.onReceiverAvailability.bind(this));
			chrome.cast.initialize(config, this.onInitSuccess, this.onInitError);
		}
		
		play(media:type.Media.Playable, url:string){
			return new Promise((resolve, reject) => {
				if(this.session)
					return this.loadMedia(media, url, resolve, reject);
			
				const onSuccess = (session:chrome.cast.Session) => {
					this.onRequestSessionSuccess(session);
					this.loadMedia(media, url, resolve, reject);
				}

				const onError = () => reject("Requesting session cancelled or failed.");

				// requestSession() must be invoked by user action!
				chrome.cast.requestSession(onSuccess, onError, this.createSessionRequest());
			})
		}
		
		loadMedia(media:type.Media.Playable, url:string, resolve:(value:unknown) => void, reject:(reason?:any) => void){
			const mediaInfo = this.toMetadata(media, url);
			const request = new chrome.cast.media.LoadRequest(mediaInfo);
			const onError = (error:any) => {
				let detail = "";
				try {
					detail = ` Received error ${error.details.type} with code ${error.details.detailedErrorCode}.`
				} catch(error){}
				reject(`Cast can't play this video.${detail}`);
			}
			this.session?.loadMedia(request, resolve, onError);
		}

		private toMetadata(media:type.Media.Playable, url:string):chrome.cast.media.IMetadata {
			const poster = (media instanceof type.Media.PlayableScc && media.posterThumbnail) || media.poster;
			const result = new chrome.cast.media.MediaInfo(url, "video/mp4");
			if(media instanceof type.Media.Episode)
				result.metadata = this.fromEpisode(media) 
			else if(media instanceof type.Media.Movie)
				result.metadata = this.fromMovide(media);
			else
				result.metadata = {title:media.title};
			if(poster)
				result.metadata.images = [{url:poster}];
			return result;
		}
		
		private fromEpisode(data:type.Media.Episode):chrome.cast.media.TvShowMediaMetadata {
			const result = new chrome.cast.media.TvShowMediaMetadata();
			result.episode = data.episodeNumber;
			result.originalAirdate = data.year;
			result.season = data.seasonNumber;
			result.seriesTitle = data.seriesTitle;
			result.title = data.title;
			return result;
		}
		
		private fromMovide(data:type.Media.Movie):chrome.cast.media.MovieMediaMetadata {
			const result = new chrome.cast.media.MovieMediaMetadata();
			result.title = data.title;
			result.studio = data.studio;
			result.releaseDate = data.year;
			return result;
		}
		
		createSessionRequest():chrome.cast.SessionRequest {
			return new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
		}
		
		onCastApiAvailable(value:any):void {
			if(value)
				this.initApi();
		}
		
		onRequestSessionSuccess(session:chrome.cast.Session):void {
			this.onSession(session);
		}
		
		onSession(session:chrome.cast.Session):void {
			this.session = session;
			this.session.addUpdateListener(() => this.onSessionUpdate(session));
		}
		
		onSessionUpdate(session:chrome.cast.Session):void {
			if(session.status === chrome.cast.SessionStatus.STOPPED)
				this.session = undefined;
		}
		
		onReceiverAvailability(value:string):void {
			this.onStatus(value === 'available');
		}
		
		onInitSuccess(){}
		onInitError(){}
	}
}
