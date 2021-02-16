namespace ymovie.util {
	export class Nav {
		static PATH_SETUP = "/setup";
		static PATH_ABOUT = "/about";
		
		static PATH_SCC_SEARCH = "/scc/search";
		static PATH_SCC_BROWSE = "/scc/browse";
		static PATH_SCC_MOVIE = "/scc/movie";
		static PATH_SCC_SERIES = "/scc/series";
		static PATH_SCC_SEASON = "/scc/season";
		static PATH_SCC_EPISODE = "/scc/episode";
		static PATH_SCC_WATCHED_MOVIES = "/watched/movies";
		static PATH_SCC_WATCHED_SERIES = "/watched/series";
		
		static PATH_WEBSHARE_SEARCH = "/webshare/search";
		static PATH_WEBSHARE_VIDEO = "/webshare/video";
		
		initialHistoryLength = 0;
		currentState:State | undefined;

		dispatcher:EventTarget | undefined;
		trigger:((type:any, detail:any) => void) | undefined;
		listen:((type:any, callback:(detail:any, event:CustomEvent) => void) => void) | undefined;

		constructor() {
			Util.enhanceDispatcher(this);
		}
		
		init(){
			this.initialHistoryLength = history.length;
			window.addEventListener("popstate", this.onWindowPopState.bind(this));
		}
		
		set title(value:string) {
			document.title = value ? `${value} | YMovie` : "YMovie";
		}
		
		get locationData():LocationData {
			const path = location.hash.substr(1);
			const regexp = /^\/[a-z]+\/[a-z]+\/([^\/]+)(\/|$)/;
			const sccMediaId = (this.isSccSeries(path) 
				|| this.isSccSeason(path) 
				|| this.isSccEpisode(path) 
				|| this.isSccMovie(path))
				? path.match(regexp)?.[1] : undefined;
			const webshareMediaId = this.isWebshareVideo(path)
				? path.match(regexp)?.[1] : undefined;
			const sccLinkLabel = this.isSccBrowse(path)
				? path.match(regexp)?.[1] : undefined;
			return {path, sccMediaId, webshareMediaId, sccLinkLabel};
		}
		
		pushState(state:any, title:string, url:string, replace?:boolean):void {
			const enhancedState = {state, title, url};
			history[replace ? "replaceState" : "pushState"](enhancedState, title, url);
			this.title = title;
			this.triggerChange(enhancedState);
			this.currentState = enhancedState;
		}
		
		safePath(source:string):string {
			return source ? Util.removeDiacritics(source).replace(/[^a-z0-9]+/gi, '-') : "";
		}
		
		go(data:any, path:string, title:string):void {
			const page = (data.page && data.page > 1) ? `/${data.page}` : '';
			this.pushState(data, title, `#${path}/${this.safePath(title)}${page}`);
		}
		
		goReplaceMedia(data:type.Type.Item):void {
			this.pushState(data, ItemDecorator.create(data).longTitle, location.hash, true);
		}
		
		goBack():void {
			if(this.initialHistoryLength === history.length)
				this.goHome();
			else
				history.back();
		}
		
		mergeState(key:string, value:string):void {
			const enhancedState = history.state;
			enhancedState.state[key] = value;
			history.replaceState(enhancedState, enhancedState.title, enhancedState.url);
		}
		
		triggerChange(enhancedState:State):void {
			const path = enhancedState.url.substr(1);
			const current = this.currentState;
			const previous = {...current, path:current?.url.substr(1)};
			this.trigger?.(enums.Action.CHANGE, {...enhancedState, path, previous});
		}
		
		goHome(replace?:boolean):void {
			this.pushState(null, "", "/", replace);
		}
		
		goSetup(relpace?:boolean):void {
			this.pushState(null, "Setup", `#${Nav.PATH_SETUP}`, relpace);
		}
		
		isSetup(path:string):boolean {
			return path?.startsWith(Nav.PATH_SETUP);
		}
		
		goAbout(replace?:boolean):void {
			this.pushState(null, "About", `#${Nav.PATH_ABOUT}`, replace);
		}
		
		isAbout(path:string):boolean {
			return path?.startsWith(Nav.PATH_ABOUT);
		}
		
		goSccSearch(query:string):void {
			this.pushState({query}, `Search ${query}`, `#${Nav.PATH_SCC_SEARCH}/${this.safePath(query)}`);
		}
		
		isSccSearch(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_SEARCH);
		}
		
		goSccBrowse(data:type.Type.CatalogueItem):void {
			this.go(data, Nav.PATH_SCC_BROWSE, data.label);
		}
		
		isSccBrowse(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_BROWSE);
		}
		
		goSccMovie(data:type.Type.Item):void {
			const decorator = ItemDecorator.create(data);
			this.go(data, `${Nav.PATH_SCC_MOVIE}/${decorator.id}`, decorator.longTitle);
		}
		
		isSccMovie(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_MOVIE);
		}
		
		goSccSeries(data:type.Type.Series):void {
			const decorator = ItemDecorator.create(data);
			this.go(data, `${Nav.PATH_SCC_SERIES}/${decorator.id}`, decorator.longTitle);
		}
		
		isSccSeries(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_SERIES);
		}
		
		goSccSeason(data:type.Type.Season):void {
			const decorator = ItemDecorator.create(data);
			this.go(data, `${Nav.PATH_SCC_SEASON}/${decorator.id}`, decorator.longTitle);
		}
		
		isSccSeason(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_SEASON);
		}
		
		goSccEpisode(data:type.Type.Episode):void {
			const decorator = ItemDecorator.create(data);
			this.go(data, `${Nav.PATH_SCC_EPISODE}/${decorator.id}`, decorator.longTitle);
		}
		
		isSccEpisode(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_EPISODE);
		}
		
		goSccWatchedMovies(relpace:boolean){
			this.pushState({}, "Watched Movies", `#${Nav.PATH_SCC_WATCHED_MOVIES}`, relpace);
		}
		
		isSccWatchedMovies(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_WATCHED_MOVIES);
		}
		
		goSccWatchedSeries(relpace:boolean):void {
			this.pushState({}, "Watched Series", `#${Nav.PATH_SCC_WATCHED_SERIES}`, relpace);
		}
		
		isSccWatchedSeries(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_WATCHED_SERIES);
		}
		
		goWebshareSearch(query:string, page:number):void {
			this.pushState({query, page}, `Search ${query}`, `#${Nav.PATH_WEBSHARE_SEARCH}/${this.safePath(query)}` + (page ? `/${page + 1}` : ""));
		}
		
		isWebshareSearch(path:string):boolean {
			return path?.startsWith(Nav.PATH_WEBSHARE_SEARCH);
		}
		
		goWebshareVideo(data:type.Type.Item):void {
			const decorator = ItemDecorator.create(data);
			this.go(data, `${Nav.PATH_WEBSHARE_VIDEO}/${decorator.id}`, decorator.title);
		}
		
		isWebshareVideo(path:string):boolean {
			return path?.startsWith(Nav.PATH_WEBSHARE_VIDEO);
		}
		
		onWindowPopState(event:PopStateEvent):void {
			const enhancedState = event.state;
			
			// ignore url entered by user
			if(!enhancedState)
				return;
			
			this.title = enhancedState?.title;
			this.triggerChange(enhancedState);
			this.currentState = enhancedState;
		}
	}

	type State = {
		state:string;
		title:string;
		url:string;
	}

	type LocationData = {
		path:string;
		sccMediaId?:string;
		webshareMediaId?:string;
		sccLinkLabel?:string;
	}
}
