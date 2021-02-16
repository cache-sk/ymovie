namespace ymovie.api {
	export class ApiScc {
		static ENDPOINT = "https://plugin.sc2.zone";
		static PATH_SEARCH = "/api/media/filter/search?order=desc&sort=score&type=*";
		static PATH_MOVIES_POPULAR = "/api/media/filter/all?type=movie&sort=playCount&order=desc";
		static PATH_MOVIES_ADDED = "/api/media/filter/all?type=movie&sort=dateAdded&order=desc";
		static PATH_MOVIES_AIRED = "/api/media/filter/news?type=movie&sort=dateAdded&order=desc&days=365";
		static PATH_DUBBED_MOVIES_AIRED = "/api/media/filter/newsDubbed?type=movie&sort=langDateAdded&order=desc&lang=cs&lang=sk&days=730";
		static PATH_NEW_ANIMATED_MOVIES = "/api/media/filter/genre?type=movie&sort=premiered&order=desc&days=365&value=Animated";
		static PATH_SERIES_POPULAR = "/api/media/filter/all?type=tvshow&sort=playCount&order=desc";
		static PATH_SERIES_ADDED = "/api/media/filter/all?type=tvshow&sort=dateAdded&order=desc";
		static PATH_SERIES_AIRED = "/api/media/filter/news?type=tvshow&sort=dateAdded&order=desc&days=365";
		static PATH_DUBBED_SERIES_AIRED = "/api/media/filter/newsDubbed?type=tvshow&sort=langDateAdded&order=desc&lang=cs&lang=sk&days=730";
		static PATH_NEW_ANIMATED_SERIES = "/api/media/filter/genre?type=tvshow&sort=premiered&order=desc&days=365&value=Animated";
		static PATH_NEW_CONCERTS = "/api/media/filter/concert?type=*&sort=premiered&order=desc";
		static PATH_NEW_FAIRY_TALES = "/api/media/filter/genre?type=movie&sort=premiered&order=desc&value=Fairy Tale";

		static TOKEN_PARAM_NAME = "access_token"
		static TOKEN_PARAM_VALUE = "th2tdy0no8v1zoh1fs59";

		private uuid:string;

		constructor(uuid:string){
			this.uuid = uuid;
		}

		async search(query:string){
			return await this.loadPath(`${ApiScc.PATH_SEARCH}&value=${encodeURIComponent(query)}`);
		}
		
		async loadPath(path:string){
			return await this.loadUrl(`${ApiScc.ENDPOINT}${path}`);
		}
		
		async loadIds(ids:Array<string>){
			const query = ids.reduce((a, c) => a + "&id=" + encodeURIComponent(c), "");
			return await this.loadPath(`/api/media/filter/ids?${query}`);
		}
		
		async loadMedia(id:string){
			return await this.loadPath(`/api/media/${id}`);
		}
		
		async loadStreams(id:string){
			return await this.loadPath(`/api/media/${id}/streams`);
		}
		
		async loadSeasons(id:string){
			return await this.loadPath(`/api/media/filter/parent?value=${id}&sort=episode`);
		}
		
		async loadEpisodes(id:string){
			return await this.loadPath(`/api/media/filter/parent?value=${id}&sort=episode`);
		}
		
		async loadUrl(url:string){
			const headers = {"X-Uuid":this.uuid};
			const finalUrl = this.appendAccessToken(url);
			return await (await fetch(finalUrl, {headers})).json();
		}
		
		appendAccessToken(url:string){
			const name = ApiScc.TOKEN_PARAM_NAME;
			const value = ApiScc.TOKEN_PARAM_VALUE;
			if(url.indexOf(`&${name}=`) != -1 || url.indexOf(`?${name}=`) != -1)
				return url;
			return url + (url.indexOf("?") != -1 ? "&" : "?") + `${name}=${value}`;
		}
	}
}
