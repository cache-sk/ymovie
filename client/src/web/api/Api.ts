/// <reference path="../type/Action.ts"/>

namespace ymovie.web.api {
	import Action = type.Action;
	import KodiPosition = type.Player.KodiPosition;
	import Media = ymovie.type.Media
	import Storage = ymovie.util.Storage;

	export class Api extends ymovie.api.Api {
		static KEY_KODI_ENDPOINT = "KODI_ENDPOINT";
		
		kodi:ApiKodi;
		cast:ApiCast;

		constructor(){
			super();
			this.kodi = new ApiKodi();
			this.cast = new ApiCast(this.onCastStatus.bind(this));
		}
		
		async init(){
			this.cast.init();
			const list:Array<KodiPosition> = [1, 2];
			for (let position of list) {
				const status = this.getKodiEndpoint(position) ? "defined" : "na";
				this.trigger?.(new Action.KodiStatusUpdated({position, status}));
			}
			await super.init();
		}
		
		getKodiEndpoint(position:KodiPosition):string | null {
			const key = Api.KEY_KODI_ENDPOINT + (position === 1 ? "" : position);
			return Storage.get(key);
		}
		
		setKodiEndpoint(position:KodiPosition, value:string) {
			const key = Api.KEY_KODI_ENDPOINT + (position === 1 ? "" : position);
			if(value === null)
				Storage.remove(key);
			else
				Storage.set(key, value);
		}
		
		async playOnCast(media:Media.PlayableScc, url:string){
			await this.cast.play(media, url);
		}
		
		async playOnKodi(position:KodiPosition, url:string){
			await this.kodi.play(<string>this.getKodiEndpoint(position), url);
		}
		
		async connectKodi(position:KodiPosition, endpoint:string) {
			try {
				this.setKodiEndpoint(position, endpoint);
				await this.kodi.isAvailable(endpoint);
				this.trigger?.(new Action.KodiStatusUpdated({position, status:"ok"}));
			} catch(error) {
				this.trigger?.(new Action.KodiStatusUpdated({position, status:"na"}));
				throw error;
			}
		}
		
		onCastStatus(available:boolean){
			this.trigger?.(new Action.CastStatusUpdates(available ? "ok" : "na"));
		}
	}
}
