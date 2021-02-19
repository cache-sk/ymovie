namespace ymovie.api {
	/**
	 * Cast sender is tricky to work on localhost (http, https), filesystem or secured domain (https).
	 * For that reason the app should be only served from https.
	 */

	import cast = chrome.cast;
	import cmedia = cast.media;
	import Media = type.Media;
	import Session = cast.Session;

	export class ApiCast {
		onStatus:(available:boolean) => void;
		session:Session | undefined;

		constructor(onStatus:(available:boolean) => void){
			this.onStatus = onStatus;
		}
		
		init(){
			if(window?.chrome && cast)
				this.initApi();
			else
				(<any>window)['__onGCastApiAvailable'] = this.onCastApiAvailable.bind(this);
		}
		
		initApi(){
			const config = new cast.ApiConfig(this.createSessionRequest(), 
				this.onSession.bind(this), this.onReceiverAvailability.bind(this));
			cast.initialize(config, this.onInitSuccess, this.onInitError);
		}
		
		play(media:Media.Playable, url:string){
			return new Promise((resolve, reject) => {
				if(this.session)
					return this.loadMedia(media, url, resolve, reject);
			
				const onSuccess = (session:Session) => {
					this.onRequestSessionSuccess(session);
					this.loadMedia(media, url, resolve, reject);
				}

				const onError = () => reject("Requesting session cancelled or failed.");

				// requestSession() must be invoked by user action!
				cast.requestSession(onSuccess, onError, this.createSessionRequest());
			})
		}
		
		loadMedia(media:Media.Playable, url:string, resolve:(value:unknown) => void, reject:(reason?:any) => void){
			const mediaInfo = this.toMetadata(media, url);
			const request = new cmedia.LoadRequest(mediaInfo);
			const onError = (error:any) => {
				let detail = "";
				try {
					detail = ` Received error ${error.details.type} with code ${error.details.detailedErrorCode}.`
				} catch(error){}
				reject(`Cast can't play this video.${detail}`);
			}
			this.session?.loadMedia(request, resolve, onError);
		}

		private toMetadata(media:Media.Playable, url:string):cmedia.IMetadata {
			const poster = util.Thumbnail.fromOriginal(media.poster);
			const result = new cmedia.MediaInfo(url, "video/mp4");
			if(media instanceof Media.Episode)
				result.metadata = this.fromEpisode(media) 
			else if(media instanceof Media.Movie)
				result.metadata = this.fromMovide(media);
			else
				result.metadata = {title:media.title};
			if(poster)
				result.metadata.images = [{url:poster}];
			return result;
		}
		
		private fromEpisode(data:Media.Episode):cmedia.TvShowMediaMetadata {
			const result = new cmedia.TvShowMediaMetadata();
			result.episode = data.episodeNumber;
			result.originalAirdate = data.year;
			result.season = data.seasonNumber;
			result.seriesTitle = data.seriesTitle;
			result.title = data.title;
			return result;
		}
		
		private fromMovide(data:Media.Movie):cmedia.MovieMediaMetadata {
			const result = new cmedia.MovieMediaMetadata();
			result.title = data.title;
			result.studio = data.studio;
			result.releaseDate = data.year;
			return result;
		}
		
		createSessionRequest():cast.SessionRequest {
			return new cast.SessionRequest(cmedia.DEFAULT_MEDIA_RECEIVER_APP_ID);
		}
		
		onCastApiAvailable(value:any):void {
			if(value)
				this.initApi();
		}
		
		onRequestSessionSuccess(session:Session):void {
			this.onSession(session);
		}
		
		onSession(session:Session):void {
			this.session = session;
			this.session.addUpdateListener(() => this.onSessionUpdate(session));
		}
		
		onSessionUpdate(session:Session):void {
			if(session.status === cast.SessionStatus.STOPPED)
				this.session = undefined;
		}
		
		onReceiverAvailability(value:string):void {
			this.onStatus(value === 'available');
		}
		
		onInitSuccess(){}
		onInitError(){}
	}
}
