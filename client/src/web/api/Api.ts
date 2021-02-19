/// <reference path="../type/Action.ts"/>
/// <reference path="../enums/Status.ts"/>
/// <reference path="../util/Storage.ts"/>
/// <reference path="../parser/Scc.ts"/>
/// <reference path="../parser/Webshare.ts"/>

namespace ymovie.api {
	import Action = type.Action;
	import Catalogue = type.Catalogue;
	import KodiPosition = type.Player.KodiPosition;
	import Media = type.Media;
	import Scc = parser.Scc;
	import Status = enums.Status;
	import Storage = util.Storage;
	import Webshare = parser.Webshare;

	export class Api {
		static KEY_UUID = "UUID";
		static KEY_KODI_ENDPOINT = "KODI_ENDPOINT";
		static KEY_WEBSHARE_TOKEN = "WEBSHARE_TOKEN";
		
		scc:ApiScc;
		webshare:ApiWebshare;
		kodi:ApiKodi;
		cast:ApiCast;

		trigger:util.Triggerer;
		listen:util.TriggerListener;

		constructor(){
			util.Trigger.enhance(this);
			this.scc = new ApiScc(this.uuid);
			this.webshare = new ApiWebshare(this.uuid);
			this.kodi = new ApiKodi();
			this.cast = new ApiCast(this.onCastStatus.bind(this));
		}
		
		async init(){
			this.cast.init();
			const list:Array<KodiPosition> = [1, 2];
			for (let position of list) {
				const status = this.getKodiEndpoint(position) ? Status.DEFINED: Status.NOT_AVAILABLE;
				this.trigger?.(new Action.KodiStatusUpdated({position, status}));
			}
			await this.checkWebshareStatus();
		}
		
		get uuid(){
			const result = Storage.get(Api.KEY_UUID);
			if(result)
				return result;
			
			const uuid = util.Util.uuidv4();
			this.uuid = uuid;
			return uuid;
		}
		
		set uuid(value){
			if(value === null)
				Storage.remove(Api.KEY_UUID);
			else
				Storage.set(Api.KEY_UUID, value);
		}
		
		get webshareToken(){
			return Storage.get(Api.KEY_WEBSHARE_TOKEN);
		}
		
		set webshareToken(value){
			if(value === null)
				Storage.remove(Api.KEY_WEBSHARE_TOKEN);
			else
				Storage.set(Api.KEY_WEBSHARE_TOKEN, value);
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
		
		async searchScc(query:string, title:string) {
			return Scc.toCatalogue(await this.scc.search(query.trim()), title);
		}
		
		isWebshareSearchQuery(query:string):boolean {
			return query.match(/[\s]+ws$/) ? true : false;
		}
		
		private normalizeWebshareSearchQuery(query:string):string {
			return query.replace(/[\s]+ws$/, "").trim();
		}

		async searchWebshare(query:string, title:string, page:number) {
			const normalizedQuery = this.normalizeWebshareSearchQuery(query);
			return Webshare.searchResponseToCatalogue(await this.webshare.search(normalizedQuery, page), query, title, page);
		}
		
		async loadMedia(id:string):Promise<Media.Scc | undefined> {
			return Scc.toItem({_id:id, _source:await this.scc.loadMedia(id)});
		}
		
		async loadPath(url:string, title:string) {
			return Scc.toCatalogue(await this.scc.loadPath(url), title);
		}
		
		async loadIds(ids:Array<string>, title:string):Promise<Array<Catalogue.AnyItem>> {
			return ids.length ? Scc.idsToCatalogue(await this.scc.loadIds(ids), ids, title) : [];
		}
		
		async loadSeasons(id:string, title:string) {
			return Scc.toCatalogue(await this.scc.loadSeasons(id), title);
		}
		
		async loadEpisodes(id:string, title:string) {
			return Scc.toCatalogue(await this.scc.loadEpisodes(id), title);
		}
		
		async loadStreams(data:Media.PlayableScc):Promise<Array<Media.Stream>> {
			return Scc.toStreams(await this.scc.loadStreams(data.id));
		}
		
		async loadWebshareMedia(ident:string) {
			return Webshare.fileInfoToItem(await this.webshare.fileInfo(ident), ident);
		}
		
		async loadWebshareStreams(data:Media.Webshare):Promise<Array<Media.Stream>> {
			const ident = data.id;
			return Webshare.fileInfoToStreams(ident, await this.webshare.fileInfo(ident));
		}
		
		async resolveStreamUrl(stream:Media.Stream){
			return await this.webshare.getLink(stream.ident, <string>this.webshareToken);
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
				this.trigger?.(new Action.KodiStatusUpdated({position, status:Status.OK}));
			} catch(error) {
				this.trigger?.(new Action.KodiStatusUpdated({position, status:Status.NOT_AVAILABLE}));
				throw error;
			}
		}
		
		async loginWebshare(username:string, password:string) {
			let success = true;
			try {
				this.webshareToken = await this.webshare.getToken(username, password);
			} catch(error) {
				success = false;
			}
			this.trigger?.(new Action.WebshareStatusUpdated(success ? Status.OK : Status.NOT_AVAILABLE));
			return success;
		}
		
		logoutWebshare(){
			this.webshareToken = null;
			this.trigger?.(new Action.WebshareStatusUpdated(Status.NOT_AVAILABLE));
		}
		
		async checkWebshareStatus(){
			let success = true;
			try {
				await this.webshare.getUsername(<string>this.webshareToken);
			} catch(error) {
				success = false;
				this.webshareToken = null;
			}
			this.trigger?.(new Action.WebshareStatusUpdated(success ? Status.OK : Status.NOT_AVAILABLE));
			return success;
		}
		
		onCastStatus(available:boolean){
			this.trigger?.(new Action.CastStatusUpdates(available ? Status.OK : Status.NOT_AVAILABLE));
		}
	}
}
