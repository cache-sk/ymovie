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
			const list:Array<type.Player.KodiPosition> = [1, 2];
			for (let position of list) {
				const status = this.getKodiEndpoint(position) ? enums.Status.DEFINED: enums.Status.NOT_AVAILABLE;
				this.trigger?.(new type.Action.KodiStatusUpdated({position, status}));
			}
			await this.checkWebshareStatus();
		}
		
		get uuid(){
			const result = util.Storage.get(Api.KEY_UUID);
			if(result)
				return result;
			
			const uuid = util.Util.uuidv4();
			this.uuid = uuid;
			return uuid;
		}
		
		set uuid(value){
			if(value === null)
				util.Storage.remove(Api.KEY_UUID);
			else
				util.Storage.set(Api.KEY_UUID, value);
		}
		
		get webshareToken(){
			return util.Storage.get(Api.KEY_WEBSHARE_TOKEN);
		}
		
		set webshareToken(value){
			if(value === null)
				util.Storage.remove(Api.KEY_WEBSHARE_TOKEN);
			else
				util.Storage.set(Api.KEY_WEBSHARE_TOKEN, value);
		}
		
		getKodiEndpoint(position:type.Player.KodiPosition):string | null {
			const key = Api.KEY_KODI_ENDPOINT + (position === 1 ? "" : position);
			return util.Storage.get(key);
		}
		
		setKodiEndpoint(position:type.Player.KodiPosition, value:string) {
			const key = Api.KEY_KODI_ENDPOINT + (position === 1 ? "" : position);
			if(value === null)
				util.Storage.remove(key);
			else
				util.Storage.set(key, value);
		}
		
		async searchScc(query:string, title:string) {
			return parser.Scc.toCatalogue(await this.scc.search(query.trim()), title);
		}
		
		isWebshareSearchQuery(query:string):boolean {
			return query.match(/[\s]+ws$/) ? true : false;
		}
		
		private normalizeWebshareSearchQuery(query:string):string {
			return query.replace(/[\s]+ws$/, "").trim();
		}

		async searchWebshare(query:string, title:string, page:number) {
			const normalizedQuery = this.normalizeWebshareSearchQuery(query);
			return parser.Webshare.searchResponseToCatalogue(await this.webshare.search(normalizedQuery, page), query, title, page);
		}
		
		async loadMedia(id:string):Promise<type.Media.Scc | undefined> {
			return parser.Scc.toItem({_id:id, _source:await this.scc.loadMedia(id)});
		}
		
		async loadPath(url:string, title:string) {
			return parser.Scc.toCatalogue(await this.scc.loadPath(url), title);
		}
		
		async loadIds(ids:Array<string>, title:string):Promise<Array<type.Catalogue.AnyItem>> {
			return parser.Scc.idsToCatalogue(await this.scc.loadIds(ids), ids, title);
		}
		
		async loadSeasons(id:string, title:string) {
			return parser.Scc.toCatalogue(await this.scc.loadSeasons(id), title);
		}
		
		async loadEpisodes(id:string, title:string) {
			return parser.Scc.toCatalogue(await this.scc.loadEpisodes(id), title);
		}
		
		async loadStreams(data:type.Media.PlayableScc):Promise<Array<type.Media.Stream>> {
			return parser.Scc.toStreams(await this.scc.loadStreams(data.id));
		}
		
		async loadWebshareMedia(ident:string) {
			return parser.Webshare.fileInfoToItem(await this.webshare.fileInfo(ident), ident);
		}
		
		async loadWebshareStreams(data:type.Media.Webshare):Promise<Array<type.Media.Stream>> {
			const ident = data.id;
			return parser.Webshare.fileInfoToStreams(ident, await this.webshare.fileInfo(ident));
		}
		
		async resolveStreamUrl(stream:type.Media.Stream){
			return await this.webshare.getLink(stream.ident, <string>this.webshareToken);
		}
		
		async playOnCast(media:type.Media.PlayableScc, url:string){
			await this.cast.play(media, url);
		}
		
		async playOnKodi(position:type.Player.KodiPosition, url:string){
			await this.kodi.play(<string>this.getKodiEndpoint(position), url);
		}
		
		async connectKodi(position:type.Player.KodiPosition, endpoint:string) {
			try {
				this.setKodiEndpoint(position, endpoint);
				await this.kodi.isAvailable(endpoint);
				this.trigger?.(new type.Action.KodiStatusUpdated({position, status:enums.Status.OK}));
			} catch(error) {
				this.trigger?.(new type.Action.KodiStatusUpdated({position, status:enums.Status.NOT_AVAILABLE}));
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
			this.trigger?.(new type.Action.WebshareStatusUpdated(success ? enums.Status.OK : enums.Status.NOT_AVAILABLE));
			return success;
		}
		
		logoutWebshare(){
			this.webshareToken = null;
			this.trigger?.(new type.Action.WebshareStatusUpdated(enums.Status.NOT_AVAILABLE));
		}
		
		async checkWebshareStatus(){
			let success = true;
			try {
				await this.webshare.getUsername(<string>this.webshareToken);
			} catch(error) {
				success = false;
				this.webshareToken = null;
			}
			this.trigger?.(new type.Action.WebshareStatusUpdated(success ? enums.Status.OK : enums.Status.NOT_AVAILABLE));
			return success;
		}
		
		onCastStatus(available:boolean){
			this.trigger?.(new type.Action.CastStatusUpdates(available ? enums.Status.OK : enums.Status.NOT_AVAILABLE));
		}
	}
}
