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
		currentState:type.Type.NavState | undefined;

		trigger:util.Triggerer;
		listen:util.TriggerListener;

		constructor() {
			Trigger.enhance(this);
		}
		
		init(){
			this.initialHistoryLength = history.length;
			window.addEventListener("popstate", this.onWindowPopState.bind(this));
		}
		
		set title(value:string) {
			document.title = value ? `${value} | YMovie` : "YMovie";
		}
		
		get locationData():type.Type.LocationData {
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
		
		pushState(state:type.Type.NavStateSource, title:string, url:string, replace?:boolean):void {
			const enhancedState = {state, title, url};
			history[replace ? "replaceState" : "pushState"](enhancedState, title, url);
			this.title = title;
			this.triggerChange(enhancedState);
			this.currentState = enhancedState;
		}
		
		safePath(source:string):string {
			return source ? Util.removeDiacritics(source).replace(/[^a-z0-9]+/gi, '-') : "";
		}
		
		go(data:type.Type.NavStateSource, path:string, title:string):void {
			const dataPage = data instanceof type.Catalogue.SccLink ? data.page : null;
			const page = (dataPage && dataPage > 1) ? `/${dataPage}` : '';
			this.pushState(data, title, `#${path}/${this.safePath(title)}${page}`);
		}
		
		goReplaceMedia(data:type.Media.Base):void {
			this.pushState(data, <string>data.longTitle, location.hash, true);
		}
		
		goBack():void {
			if(this.initialHistoryLength === history.length)
				this.goHome();
			else
				history.back();
		}
		
		assignCatalogue(value:Array<type.Catalogue.AnyItem> | undefined):void {
			const enhancedState = <type.Type.NavState>history.state;
			if(enhancedState.state)
				enhancedState.state.catalogue = value;
			history.replaceState(enhancedState, enhancedState.title, enhancedState.url);
		}
		
		triggerChange(enhancedState:type.Type.NavState):void {
			const path = enhancedState.url.substr(1);
			const current = this.currentState;
			const previous = {...current, path:current?.url.substr(1)};
			this.trigger?.(new type.Action.NavChanged(<type.Action.NavChangeData>{...enhancedState, path, previous}));
		}
		
		goHome(replace?:boolean):void {
			this.pushState(undefined, "", "/", replace);
		}
		
		goSetup(replace?:boolean):void {
			this.pushState(undefined, "Setup", `#${Nav.PATH_SETUP}`, replace);
		}
		
		isSetup(path:string):boolean {
			return path?.startsWith(Nav.PATH_SETUP);
		}
		
		goAbout(replace?:boolean):void {
			this.pushState(undefined, "About", `#${Nav.PATH_ABOUT}`, replace);
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
		
		goSccBrowse(data:type.Catalogue.SccLink):void {
			this.go(data, Nav.PATH_SCC_BROWSE, data.label);
		}
		
		isSccBrowse(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_BROWSE);
		}
		
		goSccMovie(data:type.Media.Movie):void {
			this.go(data, `${Nav.PATH_SCC_MOVIE}/${data.id}`, <string>data.title);
		}
		
		isSccMovie(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_MOVIE);
		}
		
		goSccSeries(data:type.Media.Series):void {
			this.go(data, `${Nav.PATH_SCC_SERIES}/${data.id}`, <string>data.title);
		}
		
		isSccSeries(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_SERIES);
		}
		
		goSccSeason(data:type.Media.Season):void {
			this.go(data, `${Nav.PATH_SCC_SEASON}/${data.id}`, <string>data.longTitle);
		}
		
		isSccSeason(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_SEASON);
		}
		
		goSccEpisode(data:type.Media.Episode):void {
			this.go(data, `${Nav.PATH_SCC_EPISODE}/${data.id}`, <string>data.longTitle);
		}
		
		isSccEpisode(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_EPISODE);
		}
		
		goSccWatchedMovies(relpace?:boolean){
			this.pushState(undefined, "Watched Movies", `#${Nav.PATH_SCC_WATCHED_MOVIES}`, relpace);
		}
		
		isSccWatchedMovies(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_WATCHED_MOVIES);
		}
		
		goSccWatchedSeries(relpace?:boolean):void {
			this.pushState(undefined, "Watched Series", `#${Nav.PATH_SCC_WATCHED_SERIES}`, relpace);
		}
		
		isSccWatchedSeries(path:string):boolean {
			return path?.startsWith(Nav.PATH_SCC_WATCHED_SERIES);
		}
		
		goWebshareSearch(query:string, page:number):void {
			const state:type.Type.NavStateSearch = {query, page};
			this.pushState(state, `Search ${query}`, `#${Nav.PATH_WEBSHARE_SEARCH}/${this.safePath(query)}` + (page ? `/${page + 1}` : ""));
		}
		
		isWebshareSearch(path:string):boolean {
			return path?.startsWith(Nav.PATH_WEBSHARE_SEARCH);
		}
		
		goWebshareVideo(data:type.Media.Webshare):void {
			this.go(data, `${Nav.PATH_WEBSHARE_VIDEO}/${data.id}`, <string>data.title);
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
}
