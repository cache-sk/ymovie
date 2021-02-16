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
		
		play(data:type.Type.CastSource){
			return new Promise((resolve, reject) => {
				if(this.session)
					return this.loadMedia(data, resolve, reject);
			
				const onSuccess = (session:chrome.cast.Session) => {
					this.onRequestSessionSuccess(session);
					this.loadMedia(data, resolve, reject);
				}

				const onError = (error:any) => reject("Requesting session cancelled or failed.");

				// requestSession() must be invoked by user action!
				chrome.cast.requestSession(onSuccess, onError, this.createSessionRequest());
			})
		}
		
		loadMedia(data:type.Type.CastSource, resolve:(value:unknown) => void, reject:(reason?:any) => void){
			const mediaInfo = util.CastUtil.toCastInfo(data);
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
		onInitError(data:any){}
	}
}
