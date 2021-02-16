class Nav {
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
	
	constructor(){
		ymovie.util.Util.enhanceDispatcher(this);
	}
	
	init(){
		this.initialHistoryLength = history.length;
		window.addEventListener("popstate", this.onWindowPopState.bind(this));
	}
	
	set title(value){
		document.title = value ? `${value} | YMovie` : "YMovie";
	}
	
	get locationData(){
		const path = location.hash.substr(1);
		const regexp = /^\/[a-z]+\/[a-z]+\/([^\/]+)(\/|$)/;
		const sccMediaId = (this.isSccSeries(path) 
			|| this.isSccSeason(path) 
			|| this.isSccEpisode(path) 
			|| this.isSccMovie(path))
			? path.match(regexp)?.[1] : null;
		const webshareMediaId = this.isWebshareVideo(path)
			? path.match(regexp)?.[1] : null;
		const sccLinkLabel = this.isSccBrowse(path)
			? path.match(regexp)?.[1] : null;
		return {path, sccMediaId, webshareMediaId, sccLinkLabel};
	}
	
	pushState(state, title, url, replace){
		const enhancedState = {state, title, url};
		history[replace ? "replaceState" : "pushState"](enhancedState, title, url);
		this.title = title;
		this.triggerChange(enhancedState);
		this.currentState = enhancedState;
	}
	
	safePath(source){
		return source ? ymovie.util.Util.removeDiacritics(source).replace(/[^a-z0-9]+/gi, '-') : "";
	}
	
	go(data, path, title){
		const page = (data.page && data.page > 1) ? `/${data.page}` : '';
		this.pushState(data, title, `#${path}/${this.safePath(title)}${page}`);
	}
	
	goReplaceMedia(data){
		this.pushState(data, ymovie.util.ItemDecorator.create(data).longTitle, location.hash, true);
	}
	
	goBack(){
		if(this.initialHistoryLength === history.length)
			this.goHome();
		else
			history.back();
	}
	
	mergeState(key, value){
		const enhancedState = history.state;
		enhancedState.state[key] = value;
		history.replaceState(enhancedState, enhancedState.title, enhancedState.url);
	}
	
	triggerChange(enhancedState){
		const path = enhancedState.url.substr(1);
		const current = this.currentState;
		const previous = {...current, path:current?.url.substr(1)};
		this.trigger(Action.CHANGE, {...enhancedState, path, previous});
	}
	
		goHome(replace){
		this.pushState(null, "", "/", replace);
	}
	
	goHome(replace){
		this.pushState(null, "", "/", replace);
	}
	
	goSetup(relpace){
		this.pushState(null, "Setup", `#${this.constructor.PATH_SETUP}`, relpace);
	}
	
	isSetup(path){
		return path?.startsWith(this.constructor.PATH_SETUP);
	}
	
	goAbout(replace){
		this.pushState(null, "About", `#${this.constructor.PATH_ABOUT}`, replace);
	}
	
	isAbout(path){
		return path?.startsWith(this.constructor.PATH_ABOUT);
	}
	
	goSccSearch(query){
		this.pushState({query}, `Search ${query}`, `#${this.constructor.PATH_SCC_SEARCH}/${this.safePath(query)}`);
	}
	
	isSccSearch(path){
		return path?.startsWith(this.constructor.PATH_SCC_SEARCH);
	}
	
	goSccBrowse(data){
		this.go(data, this.constructor.PATH_SCC_BROWSE, data.label);
	}
	
	isSccBrowse(path){
		return path?.startsWith(this.constructor.PATH_SCC_BROWSE);
	}
	
	goSccMovie(data){
		const decorator = ymovie.util.ItemDecorator.create(data);
		this.go(data, `${this.constructor.PATH_SCC_MOVIE}/${decorator.id}`, decorator.longTitle);
	}
	
	isSccMovie(path){
		return path?.startsWith(this.constructor.PATH_SCC_MOVIE);
	}
	
	goSccSeries(data){
		const decorator = ymovie.util.ItemDecorator.create(data);
		this.go(data, `${this.constructor.PATH_SCC_SERIES}/${decorator.id}`, decorator.longTitle);
	}
	
	isSccSeries(path){
		return path?.startsWith(this.constructor.PATH_SCC_SERIES);
	}
	
	goSccSeason(data){
		const decorator = ymovie.util.ItemDecorator.create(data);
		this.go(data, `${this.constructor.PATH_SCC_SEASON}/${decorator.id}`, decorator.longTitle);
	}
	
	isSccSeason(path){
		return path?.startsWith(this.constructor.PATH_SCC_SEASON);
	}
	
	goSccEpisode(data){
		const decorator = ymovie.util.ItemDecorator.create(data);
		this.go(data, `${this.constructor.PATH_SCC_EPISODE}/${decorator.id}`, decorator.longTitle);
	}
	
	isSccEpisode(path){
		return path?.startsWith(this.constructor.PATH_SCC_EPISODE);
	}
	
	goSccWatchedMovies(relpace){
		this.pushState({}, "Watched Movies", `#${this.constructor.PATH_SCC_WATCHED_MOVIES}`, relpace);
	}
	
	isSccWatchedMovies(path){
		return path?.startsWith(this.constructor.PATH_SCC_WATCHED_MOVIES);
	}
	
	goSccWatchedSeries(relpace){
		this.pushState({}, "Watched Series", `#${this.constructor.PATH_SCC_WATCHED_SERIES}`, relpace);
	}
	
	isSccWatchedSeries(path){
		return path?.startsWith(this.constructor.PATH_SCC_WATCHED_SERIES);
	}
	
	goWebshareSearch(query, page){
		this.pushState({query, page}, `Search ${query}`, `#${this.constructor.PATH_WEBSHARE_SEARCH}/${this.safePath(query)}` + (page ? `/${page + 1}` : ""));
	}
	
	isWebshareSearch(path){
		return path?.startsWith(this.constructor.PATH_WEBSHARE_SEARCH);
	}
	
	goWebshareVideo(data){
		const decorator = ymovie.util.ItemDecorator.create(data);
		this.go(data, `${this.constructor.PATH_WEBSHARE_VIDEO}/${decorator.id}`, decorator.title);
	}
	
	isWebshareVideo(path){
		return path?.startsWith(this.constructor.PATH_WEBSHARE_VIDEO);
	}
	
	onWindowPopState(event){
		const enhancedState = event.state;
		
		// ignore url entered by user
		if(!enhancedState)
			return;
		
		this.title = enhancedState?.title;
		this.triggerChange(enhancedState);
		this.currentState = enhancedState;
	}
}
