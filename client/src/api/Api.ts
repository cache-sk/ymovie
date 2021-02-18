namespace ymovie.api {
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
			for (let position = 1; position <= 2; position++) {
				const status = this.getKodiEndpoint(position) ? enums.PlayerStatus.DEFINED: enums.PlayerStatus.NOT_AVAILABLE;
				this.trigger?.(new type.Action.KodiStatusUpdated({position, status}));
			}
			await this.checkWebshareStatus();
		}
		
		get uuid(){
			const result = util.MyStorage.get(Api.KEY_UUID);
			if(result)
				return result;
			
			const uuid = util.Util.uuidv4();
			this.uuid = uuid;
			return uuid;
		}
		
		set uuid(value){
			if(value === null)
				util.MyStorage.remove(Api.KEY_UUID);
			else
				util.MyStorage.set(Api.KEY_UUID, value);
		}
		
		get webshareToken(){
			return util.MyStorage.get(Api.KEY_WEBSHARE_TOKEN);
		}
		
		set webshareToken(value){
			if(value === null)
				util.MyStorage.remove(Api.KEY_WEBSHARE_TOKEN);
			else
				util.MyStorage.set(Api.KEY_WEBSHARE_TOKEN, value);
		}
		
		getKodiEndpoint(position:number):string | null {
			const key = Api.KEY_KODI_ENDPOINT + (position === 1 ? "" : position);
			return util.MyStorage.get(key);
		}
		
		setKodiEndpoint(position:number, value:string) {
			const key = Api.KEY_KODI_ENDPOINT + (position === 1 ? "" : position);
			if(value === null)
				util.MyStorage.remove(key);
			else
				util.MyStorage.set(key, value);
		}
		
		async searchScc(query:string, title:string) {
			return util.SccUtil.normalizeResponse(await this.scc.search(query.trim()), title);
		}
		
		async searchWebshare(query:string, title:string, page:number) {
			const normalizedQuery = util.WebshareUtil.normalizeSearchQuery(query);
			return util.WebshareUtil.normalizeSearchResponse(await this.webshare.search(normalizedQuery, page), query, title, page);
		}
		
		async loadMedia(id:string):Promise<type.Type.Item | undefined> {
			return util.SccUtil.normalizeItem({_id:id, _source:await this.scc.loadMedia(id)});
		}
		
		async loadPath(url:string, title:string){
			return util.SccUtil.normalizeResponse(await this.scc.loadPath(url), title);
		}
		
		async loadIds(ids:Array<string>, title:string):Promise<Array<type.Type.AnyCatalogueItem>> {
			return util.SccUtil.normalizeIdsResponse(await this.scc.loadIds(ids), ids, title);
		}
		
		async loadSeasons(id:string, title:string) {
			return util.SccUtil.normalizeResponse(await this.scc.loadSeasons(id), title);
		}
		
		async loadEpisodes(id:string, title:string) {
			return util.SccUtil.normalizeResponse(await this.scc.loadEpisodes(id), title);
		}
		
		async loadStreams(data:type.Type.PlayableSccItem):Promise<Array<type.Type.Stream>> {
			return util.SccUtil.normalizeStreams(await this.scc.loadStreams(data.id));
		}
		
		async loadWebshareMedia(ident:string) {
			return util.WebshareUtil.normalizeItemResponse(await this.webshare.fileInfo(ident), ident);
		}
		
		async loadWebshareStreams(data:type.Type.WebshareItem):Promise<Array<type.Type.Stream>> {
			const ident = data.id;
			return util.WebshareUtil.normalizeStreams(ident, await this.webshare.fileInfo(ident));
		}
		
		async resolveStreamUrl(stream:type.Type.Stream){
			return await this.webshare.getLink(stream.ident, <string>this.webshareToken);
		}
		
		async playOnCast(data:type.Type.PlayableStream){
			await this.cast.play(data);
		}
		
		async playOnKodi(position:number, data:type.Type.PlayableStream){
			await this.kodi.play(<string>this.getKodiEndpoint(position), <string>data.url);
		}
		
		async connectKodi(position:number, endpoint:string) {
			try {
				this.setKodiEndpoint(position, endpoint);
				await this.kodi.isAvailable(endpoint);
				this.trigger?.(new type.Action.KodiStatusUpdated({position, status:enums.PlayerStatus.OK}));
			} catch(error) {
				this.trigger?.(new type.Action.KodiStatusUpdated({position, status:enums.PlayerStatus.NOT_AVAILABLE}));
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
			this.trigger?.(new type.Action.WebshareStatusUpdated(success ? enums.PlayerStatus.OK : enums.PlayerStatus.NOT_AVAILABLE));
			return success;
		}
		
		logoutWebshare(){
			this.webshareToken = null;
			this.trigger?.(new type.Action.WebshareStatusUpdated(enums.PlayerStatus.NOT_AVAILABLE));
		}
		
		async checkWebshareStatus(){
			let success = true;
			try {
				await this.webshare.getUsername(<string>this.webshareToken);
			} catch(error) {
				success = false;
				this.webshareToken = null;
			}
			this.trigger?.(new type.Action.WebshareStatusUpdated(success ? enums.PlayerStatus.OK : enums.PlayerStatus.NOT_AVAILABLE));
			return success;
		}
		
		onCastStatus(available:boolean){
			this.trigger?.(new type.Action.CastStatusUpdates(available ? enums.PlayerStatus.OK : enums.PlayerStatus.NOT_AVAILABLE));
		}
	}
}
