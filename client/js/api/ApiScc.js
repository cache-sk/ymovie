class ApiScc {
	static ENDPOINT = "https://plugin.sc2.zone";
	static PATH_SEARCH = "/api/media/filter/search?order=desc&sort=score&type=*";
	static PATH_MOVIES_POPULAR = "/api/media/filter/all?type=movie&sort=playCount&order=desc";
	static PATH_MOVIES_ADDED = "/api/media/filter/all?type=movie&sort=dateAdded&order=desc";
	static PATH_MOVIES_AIRED = "/api/media/filter/news?type=movie&sort=dateAdded&order=desc&days=365";
	static PATH_DUBBED_MOVIES_AIRED = "/api/media/filter/newsDubbed?type=movie&sort=dateAdded&order=desc&lang=cs&lang=sk&days=365";
	static PATH_SERIES_POPULAR = "/api/media/filter/all?type=tvshow&sort=playCount&order=desc";
	static PATH_SERIES_ADDED = "/api/media/filter/all?type=tvshow&sort=dateAdded&order=desc";
	static PATH_SERIES_AIRED = "/api/media/filter/news?type=tvshow&sort=dateAdded&order=desc&days=365";
	static PATH_DUBBED_SERIES_AIRED = "/api/media/filter/newsDubbed?type=tvshow&sort=dateAdded&order=desc&lang=cs&lang=sk&days=365";

	static TOKEN_PARAM_NAME = "access_token"
	static TOKEN_PARAM_VALUE = "th2tdy0no8v1zoh1fs59";

	constructor(uuid){
		this.uuid = uuid;
	}

	async search(query){
		return await this.loadPath(`${this.constructor.PATH_SEARCH}&value=${encodeURIComponent(query)}`);
	}
	
	async loadPath(path){
		return await this.loadUrl(`${this.constructor.ENDPOINT}${path}`);
	}
	
	async loadIds(ids){
		const query = ids.reduce((a, c) => a + "&id=" + encodeURIComponent(c), "");
		return await this.loadPath(`/api/media/filter/ids?${query}`);
	}
	
	async loadMedia(id){
		return await this.loadPath(`/api/media/${id}`);
	}
	
	async loadStreams(id){
		return await this.loadPath(`/api/media/${id}/streams`);
	}
	
	async loadSeasons(id){
		return await this.loadPath(`/api/media/filter/parent?value=${id}&sort=episode`);
	}
	
	async loadEpisodes(id){
		return await this.loadPath(`/api/media/filter/parent?value=${id}&sort=episode`);
	}
	
	async loadUrl(url){
		const headers = {"X-Uuid":this.uuid};
		const finalUrl = this.appendAccessToken(url);
		return await (await fetch(finalUrl, {headers})).json();
	}
	
	appendAccessToken(url){
		const name = this.constructor.TOKEN_PARAM_NAME;
		const value = this.constructor.TOKEN_PARAM_VALUE;
		if(url.includes(`&${name}=`) || url.includes(`?${name}=`))
			return url;
		return url + (url.includes("?") ? "&" : "?") + `${name}=${value}`;
	}
}
