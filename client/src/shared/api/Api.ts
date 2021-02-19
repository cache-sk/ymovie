/// <reference path="ApiScc.ts"/>
/// <reference path="ApiWebshare.ts"/>
/// <reference path="../parser/Scc.ts"/>
/// <reference path="../parser/Webshare.ts"/>
/// <reference path="../util/Storage.ts"/>
/// <reference path="../type/Action.ts"/>

namespace ymovie.api {
	import Action = type.Action;
	import ApiScc = ymovie.api.ApiScc;
	import ApiWebshare = ymovie.api.ApiWebshare;
	import Catalogue = type.Catalogue;
	import Media = type.Media;
	import Scc = parser.Scc;
	import Storage = util.Storage;
	import Webshare = parser.Webshare;

	export abstract class Api {
		static KEY_UUID = "UUID";
		static KEY_WEBSHARE_TOKEN = "WEBSHARE_TOKEN";
		
		scc:ApiScc;
		webshare:ApiWebshare;

		trigger:util.Trigger.Triggerer;
		listen:util.Trigger.Listener;

		constructor(){
			util.Trigger.enhance(this);
			this.scc = new ApiScc(this.uuid);
			this.webshare = new ApiWebshare(this.uuid);
		}
		
		async init(){
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
		
		async loginWebshare(username:string, password:string) {
			let success = true;
			try {
				this.webshareToken = await this.webshare.getToken(username, password);
			} catch(error) {
				success = false;
			}
			this.trigger?.(new Action.WebshareStatusUpdated(success ? "ok" : "na"));
			return success;
		}
		
		logoutWebshare(){
			this.webshareToken = null;
			this.trigger?.(new Action.WebshareStatusUpdated("na"));
		}
		
		async checkWebshareStatus(){
			let success = true;
			try {
				await this.webshare.getUsername(<string>this.webshareToken);
			} catch(error) {
				success = false;
				this.webshareToken = null;
			}
			this.trigger?.(new Action.WebshareStatusUpdated(success ? "ok" : "na"));
			return success;
		}
	}
}
