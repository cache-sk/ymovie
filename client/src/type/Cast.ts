declare namespace chrome.cast {
	function initialize(config:ApiConfig, 
			successHandler:() => void,
			errorHandler:(error:any) => void):void;

	function requestSession(
		successHandler:(session:Session) => void,
		errorHandler:(error:any) => void,
		request:SessionRequest):void;

	class ApiConfig {
		constructor(sessionRequest:SessionRequest, 
			sessionHandler:(session:Session) => void,
			receiverAvailabilityHandler:(value:string) => void)
	}

	class SessionRequest {
		constructor(appId:string);
	}

	class SessionStatus {
		static STOPPED:string;
	}

	namespace media {
		var DEFAULT_MEDIA_RECEIVER_APP_ID:string;

		interface IMetadata {
			images:Array<{url:string}> | undefined;
		}

		class MovieMediaMetadata implements IMetadata {
			title:string | undefined;
			studio:string | undefined;
			releaseDate:string | undefined;
			images:Array<{url:string}> | undefined;
		}

		class TvShowMediaMetadata implements IMetadata {
			episode:number | undefined;
			originalAirdate:string;
			season:number | undefined;
			seriesTitle:string | undefined;
			title:string | undefined;
			images:Array<{url:string}> | undefined;
		}

		class MediaInfo {
			metadata:IMetadata;
			images:Array<{url:string}> | undefined;
			constructor(url:string, type:string);
		}

		class LoadRequest {
			constructor(mediaInfo:IMetadata);
		}
	}

	class Session {
		loadMedia(request:media.LoadRequest, 
			resolve:(value:unknown) => void, 
			reject:(reason?:any) => void):void;
		addUpdateListener(listener:() => void):void;
		status:string;
	}
}
