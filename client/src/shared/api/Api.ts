/// <reference path="../util/Signal.ts"/>
/// <reference path="../util/Storage.ts"/>

namespace ymovie.api {
	import Catalogue = type.Catalogue;
	import Media = type.Media;
	import Storage = util.Storage;
	import Signal1 = util.Signal.Signal1;

	export abstract class Api {
		static readonly KEY_UUID = "UUID";
		static readonly KEY_WEBSHARE_TOKEN = "WEBSHARE_TOKEN";
		
		protected readonly ymovie:YMovie.Api;
		protected readonly scc:Scc.Api;
		protected readonly webshare:Webshare.Api;

		readonly webshareStatusChanged = new Signal1<type.Status>();

		constructor(){
			this.ymovie = new YMovie.Api();
			this.scc = new Scc.Api(this.uuid);
			this.webshare = new Webshare.Api(this.uuid);
		}
		
		async init(){
			await this.checkWebshareStatus();
		}
		
		private get uuid(){
			const result = Storage.get(Api.KEY_UUID);
			if(result)
				return result;
			
			const uuid = util.Util.uuidv4();
			this.uuid = uuid;
			return uuid;
		}
		
		private set uuid(value){
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
		
		async searchScc(query:string, title:string):Promise<Array<Catalogue.AnyItem>> {
			return Scc.Parser.toCatalogue(await this.scc.search(query.trim()), title);
		}
		
		isWebshareSearchQuery(query:string):boolean {
			return query.match(/[\s]+ws$/) ? true : false;
		}
		
		private normalizeWebshareSearchQuery(query:string):string {
			return query.replace(/[\s]+ws$/, "").trim();
		}

		async searchWebshare(query:string, title:string, page:number) {
			const normalizedQuery = this.normalizeWebshareSearchQuery(query);
			return Webshare.Parser.searchResponseToCatalogue(await this.webshare.search(normalizedQuery, page), query, title, page);
		}
		
		async loadMedia(id:string):Promise<Media.Scc | undefined> {
			return Scc.Parser.toItem({_id:id, _source:await this.scc.loadMedia(id)});
		}
		
		async loadPath(url:string, title:string):Promise<Array<Catalogue.AnyItem>> {
			return Scc.Parser.toCatalogue(await this.scc.loadPath(url), title);
		}
		
		async loadIds(ids:Array<string>, title:string):Promise<Array<Catalogue.AnyItem>> {
			return ids.length ? Scc.Parser.idsToCatalogue(await this.scc.loadIds(ids), ids, title) : [];
		}

		async loadSeasons(id:string, title:string) {
			return Scc.Parser.toCatalogue(await this.scc.loadSeasons(id), title);
		}

		async loadEpisodes(id:string, title:string) {
			return Scc.Parser.toCatalogue(await this.scc.loadEpisodes(id), title);
		}
		
		async loadStreams(data:Media.PlayableScc):Promise<Array<Media.Stream>> {
			return Scc.Parser.toStreams(await this.scc.loadStreams(data.id));
		}
		
		async loadWebshareMedia(ident:string) {
			return Webshare.Parser.fileInfoToItem(await this.webshare.fileInfo(ident), ident);
		}
		
		async loadWebshareStreams(data:Media.Webshare):Promise<Array<Media.Stream>> {
			const ident = data.id;
			return Webshare.Parser.fileInfoToStreams(ident, await this.webshare.fileInfo(ident));
		}
		
		resolveStreamUrl(stream:Media.Stream, https:boolean=false):Promise<string> {
			return this.webshare.getLink(stream.ident, https, <string>this.webshareToken);
		}
		
		async loginWebshare(username:string, password:string) {
			let success = true;
			try {
				this.webshareToken = await this.webshare.getToken(username, password);
			} catch(error) {
				success = false;
			}
			this.webshareStatusChanged.dispatch(success ? "ok" : "na");
			return success;
		}
		
		logoutWebshare(){
			this.webshareToken = null;
			this.webshareStatusChanged.dispatch("na");
		}
		
		async checkWebshareStatus(){
			let success = true;
			try {
				await this.webshare.getUsername(<string>this.webshareToken);
			} catch(error) {
				success = false;
				this.webshareToken = null;
			}
			this.webshareStatusChanged.dispatch(success ? "ok" : "na");
			return success;
		}

		pairPut(token:string, deviceId:string) {
			return this.ymovie.pairPut(token, deviceId);
		}
	}
}
