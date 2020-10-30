/**
 * Cast sender is tricky to work on localhost (http, https), filesystem or secured domain (https).
 * For that reason the app should be only served from https.
 */
class ApiCast {
	constructor(onStatus){
		this.onStatus = onStatus;
	}
	
	init(){
		if(window?.chrome && chrome.cast)
			this.initApi();
		else
			window['__onGCastApiAvailable'] = this.onCastApiAvailable.bind(this);
	}
	
	initApi(){
		const config = new chrome.cast.ApiConfig(this.createSessionRequest(), 
			this.onSession.bind(this), this.onReceiverAvailability.bind(this));
		chrome.cast.initialize(config, this.onInitSuccess, this.onInitError);
	}
	
	play(data){
		return new Promise((resolve, reject) => {
			if(this.session)
				return this.loadMedia(data, resolve, reject);
		
			const onSuccess = session => {
				this.onRequestSessionSuccess(session);
				this.loadMedia(data, resolve, reject);
			}

			const onError = error => reject("Requesting session cancelled or failed.");

			// requestSession() must be invoked by user action!
			chrome.cast.requestSession(onSuccess, onError, this.createSessionRequest());
		})
	}
	
	loadMedia(data, resolve, reject){
		const mediaInfo = CastUtil.toCastInfo(data);
		const request = new chrome.cast.media.LoadRequest(mediaInfo);
		const onError = error => {
			let detail = "";
			try {
				detail = ` Received error ${error.details.type} with code ${error.details.detailedErrorCode}.`
			} catch(error){}
			reject(`Cast can't play this video.${detail}`);
		}
		this.session.loadMedia(request, resolve, onError);
	}
	
	createSessionRequest(){
		return new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
	}
	
	onCastApiAvailable(value){
		if(value)
			this.initApi();
	}
	
	onRequestSessionSuccess(session){
		this.onSession(session);
	}
	
	onSession(session){
		this.session = session;
		this.session.addUpdateListener(() => this.onSessionUpdate(session));
	}
	
	onSessionUpdate(session){
		if(session.status === chrome.cast.SessionStatus.STOPPED)
			this.session = null;
	}
	
	onReceiverAvailability(value){
		this.onStatus(value === 'available');
	}
	
	onInitSuccess(){}
	onInitError(data){}
}
