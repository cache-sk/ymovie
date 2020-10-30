class Api {
	static KEY_UUID = "UUID";
	static KEY_KODI_ENDPOINT = "KODI_ENDPOINT";
	static KEY_WEBSHARE_TOKEN = "WEBSHARE_TOKEN";
	static KEY_WATCHED_MOVIES = "KEY_WATCHED_MOVIES";
	static KEY_WATCHED_SERIES = "KEY_WATCHED_SERIES";
	static MAX_WATCHED_LENGTH = 100;
	
	constructor(){
		Util.enhanceDispatcher(this);
		this.scc = new ApiScc(this.uuid);
		this.webshare = new ApiWebshare(this.uuid);
		this.kodi = new ApiKodi();
		this.cast = new ApiCast(this.onCastStatus.bind(this));
	}
	
	async init(){
		this.cast.init();
		for (let position = 1; position <= 2; position++)
			this.trigger(this.getKodiStatusKey(position), this.getKodiEndpoint(position)
				? PlayerStatus.DEFINED: PlayerStatus.NOT_AVAILABLE);
		await this.checkWebshareStatus();
	}
	
	get uuid(){
		const result = this.getItem(this.constructor.KEY_UUID);
		if(result)
			return result;
		
		const uuid = Util.uuidv4();
		this.uuid = uuid;
		return uuid;
	}
	
	set uuid(value){
		if(value === null)
			this.removeItem(this.constructor.KEY_UUID);
		else
			this.setItem(this.constructor.KEY_UUID, value);
	}
	
	get webshareToken(){
		return this.getItem(this.constructor.KEY_WEBSHARE_TOKEN);
	}
	
	set webshareToken(value){
		if(value === null)
			this.removeItem(this.constructor.KEY_WEBSHARE_TOKEN);
		else
			this.setItem(this.constructor.KEY_WEBSHARE_TOKEN, value);
	}
	
	get storage(){
		return window.localStorage;
	}
	
	setItem(key, value){
		this.storage.setItem(key, value);
	}
	
	getItem(key){
		return this.storage.getItem(key);
	}
	
	removeItem(key){
		this.storage.removeItem(key);
	}
	
	getKodiEndpoint(position){
		const key = this.constructor.KEY_KODI_ENDPOINT + (position === 1 ? "" : position);
		return this.getItem(key);
	}
	
	setKodiEndpoint(position, value){
		const key = this.constructor.KEY_KODI_ENDPOINT + (position === 1 ? "" : position);
		if(value === null)
			this.removeItem(key);
		else
			this.setItem(key, value);
	}
	
	getKodiStatusKey(position){
		return "kodiStatus" + (position === 1 ? "" : position);
	}
	
	addWatchedMovie(id){
		const key = this.constructor.KEY_WATCHED_MOVIES;
		const max = this.constructor.MAX_WATCHED_LENGTH;
		this.setItem(key, Util.unshiftAndLimit(this.watchedMovies, id, max).join(","));
	}
	
	get watchedMovies(){
		const key = this.constructor.KEY_WATCHED_MOVIES;
		const data = this.getItem(key);
		return data ? data.split(",") : [];
	}
	
	addWatchedSeries(id){
		const key = this.constructor.KEY_WATCHED_SERIES;
		const max = this.constructor.MAX_WATCHED_LENGTH;
		this.setItem(key, Util.unshiftAndLimit(this.watchedSeries, id, max).join(","));
	}
	
	get watchedSeries(){
		const key = this.constructor.KEY_WATCHED_SERIES;
		const data = this.getItem(key);
		return data ? data.split(",") : [];
	}
	
	async searchScc(query, title){
		return SccUtil.normalizeResponse(await this.scc.search(query.trim()), title);
	}
	
	async searchWebshare(query, title, page){
		const normalizedQuery = WebshareUtil.normalizeSearchQuery(query);
		return WebshareUtil.normalizeSearchResponse(await this.webshare.search(normalizedQuery, page), query, title, page);
	}
	
	async loadMedia(id){
		return SccUtil.normalizeItem({_id:id, _source:await this.scc.loadMedia(id)});
	}
	
	async loadPath(url, title){
		return SccUtil.normalizeResponse(await this.scc.loadPath(url), title);
	}
	
	async loadIds(ids, title){
		return SccUtil.normalizeIdsResponse(await this.scc.loadIds(ids), ids, title);
	}
	
	async loadSeasons(id, title){
		return SccUtil.normalizeResponse(await this.scc.loadSeasons(id), title);
	}
	
	async loadEpisodes(id, title){
		return SccUtil.normalizeResponse(await this.scc.loadEpisodes(id), title);
	}
	
	async loadStreams(data){
		return SccUtil.normalizeStreams(await this.scc.loadStreams(data.id));
	}
	
	async loadWebshareMedia(ident){
		return WebshareUtil.normalizeItemResponse(await this.webshare.fileInfo(ident), ident);
	}
	
	async loadWebshareStrams(data){
		const ident = data.id;
		return WebshareUtil.normalizeStreams(ident, await this.webshare.fileInfo(ident));
	}
	
	async resolveStreamUrl(stream){
		return await this.webshare.getLink(stream.ident, this.webshareToken);
	}
	
	async playOnCast(data){
		await this.cast.play(data);
	}
	
	async playOnKodi(position, data){
		await this.kodi.play(this.getKodiEndpoint(position), data.url);
	}
	
	async connectKodi(position, endpoint){
		try {
			this.setKodiEndpoint(position, endpoint);
			await this.kodi.isAvailable(endpoint);
			this.trigger(this.getKodiStatusKey(position), PlayerStatus.OK);
		} catch(error) {
			this.trigger(this.getKodiStatusKey(position), PlayerStatus.NOT_AVAILABLE);
			throw error;
		}
	}
	
	async loginWebshare(username, password){
		let success = true;
		try {
			this.webshareToken = await this.webshare.getToken(username, password);
		} catch(error) {
			success = false;
		}
		this.trigger(Action.WEBSHARE_STATUS_UPDATED, success ? PlayerStatus.OK : PlayerStatus.NOT_AVAILABLE);
		return success;
	}
	
	logoutWebshare(){
		this.webshareToken = null;
		this.trigger(Action.WEBSHARE_STATUS_UPDATED, PlayerStatus.NOT_AVAILABLE);
	}
	
	async checkWebshareStatus(){
		let success = true;
		try {
			await this.webshare.getUsername(this.webshareToken);
		} catch(error) {
			success = false;
			this.webshareToken = null;
		}
		this.trigger(Action.WEBSHARE_STATUS_UPDATED, success ? PlayerStatus.OK : PlayerStatus.NOT_AVAILABLE);
		return success;
	}
	
	onCastStatus(available){
		this.trigger(Action.CAST_STATUS_UPDATED, available ? PlayerStatus.OK : PlayerStatus.NOT_AVAILABLE);
	}
}
