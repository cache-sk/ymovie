class App extends Component {
	static async init(){
		const result = new App();
		await result.init();
	}

	constructor(){
		super(document.body);
	}
	
	async init(){
		// cast only works on filesystem, localhost or https (for real domains)
		// also do not redirect on IP, as there is no https alternative
		if(location.protocol === "http:" 
			&& location.hostname !== "localhost" 
			&& location.hostname !== "localhost.charlesproxy.com"
			&& !location.hostname.match(/^[\.0-9]+$/))
			return location.protocol = "https:";
		
		this.initPWA();
		this.api = new Api();
		this.nav = new Nav();
		this.ga = new GA();
		
		this.setupView = new SetupView(this.api);
		this.aboutView = new AboutView();
		this.discoveryView = new DiscoveryView();
		this.detailView = new DetailView(this.api);
		this.notificationView = new NotificationView();

		this.listen(Action.BACK, this.nav.goBack.bind(this.nav));
		this.listen(Action.SEARCH, this.search.bind(this));
		this.listen(Action.SELECT_CATALOGUE_ITEM, this.selectCatalogueItem.bind(this));
		this.listen(Action.RESOLVE_STREAMS, this.resolveStreams.bind(this));
		this.listen(Action.RESOLVE_STREAM_URL, this.resolveStreamUrl.bind(this));
		this.listen(Action.HOME, this.nav.goHome.bind(this.nav));
		this.listen(Action.SETUP, this.nav.goSetup.bind(this.nav));
		this.listen(Action.ABOUT, this.nav.goAbout.bind(this.nav));
		this.listen(Action.PLAY, this.play.bind(this));
		
		this.ga.init();
		
		this.nav.listen(Action.CHANGE, this.onNavChange.bind(this));
		this.nav.init();
		
		this.api.listen(Action.CAST_STATUS_UPDATED, this.onApiCastStatus.bind(this));
		this.api.listen(this.api.getKodiStatusKey(1), this.onApiKodiStatus.bind(this));
		this.api.listen(this.api.getKodiStatusKey(2), this.onApiKodiStatus2.bind(this));
		this.api.listen(Action.WEBSHARE_STATUS_UPDATED, this.onApiWebshareStatus.bind(this));
		await this.api.init();
		
		this.render();
		await this.initDeeplink();
		this.element.classList.toggle("initializing", false);
		
		this.initCast();
		this.initAnalytics();
	}
	
	async initPWA(){
		try {
			navigator.serviceWorker.register('/manifest-worker.js')
		}catch(error){}
	}
	
	async initDeeplink(){
		const {path, sccMediaId, webshareMediaId} = this.nav.locationData;
		if(sccMediaId)
			return this.nav.goReplaceMedia(await this.api.loadMedia(sccMediaId));
		if(webshareMediaId)
			return this.nav.goReplaceMedia(await this.api.loadWebshareMedia(webshareMediaId));
		if(this.nav.isAbout(path))
			return this.nav.goAbout(true);
		if(this.nav.isSetup(path))
			return this.nav.goSetup(true);
		if(this.nav.isSccWatchedMovies(path))
			return this.nav.goSccWatchedMovies(true);
		if(this.nav.isSccWatchedSeries(path))
			return this.nav.goSccWatchedSeries(true);
		this.nav.goHome(true);
	}
	
	initCast(){
		DOM.append(document.body, DOM.script("https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"));
	}
	
	initAnalytics(){
		DOM.append(document.body, DOM.script("https://www.google-analytics.com/analytics.js"));
	}
	
	render(){
		this.append([
			this.updateCatalogue(this.createHome()),
			this.detailView.render(),
			this.setupView.render(),
			this.aboutView.render(),
			this.notificationView.render()]);
		return super.render();
	}

	createHome(){
		return [
			CatalogueUtil.createSccLink("movie", "Released Movies", ApiScc.PATH_MOVIES_AIRED),
			CatalogueUtil.createSccLink("series", "Released Series", ApiScc.PATH_SERIES_AIRED),
			CatalogueUtil.createSccLink("movie", "Released Movies CZ/SK", ApiScc.PATH_DUBBED_MOVIES_AIRED),
			CatalogueUtil.createSccLink("series", "Released Series CZ/SK", ApiScc.PATH_DUBBED_SERIES_AIRED),
			CatalogueUtil.createSccLink("movie", "Popular Movies", ApiScc.PATH_MOVIES_POPULAR),
			CatalogueUtil.createSccLink("series", "Popular Series", ApiScc.PATH_SERIES_POPULAR),
			CatalogueUtil.createSccLink("movie", "Added Movies", ApiScc.PATH_MOVIES_ADDED),
			CatalogueUtil.createSccLink("series", "Added Series", ApiScc.PATH_SERIES_ADDED),
			CatalogueUtil.createCallback("movie", "Watched Movies", this.nav.goSccWatchedMovies.bind(this.nav)),
			CatalogueUtil.createCallback("series", "Watched Series", this.nav.goSccWatchedSeries.bind(this.nav))];
	}

	toggleClass(key, toggle){
		this.element.classList.toggle(key, toggle);
	}
	
	toggleApiClass(key, status){
		this.toggleClass(`${key}-${PlayerStatus.OK}`, status === PlayerStatus.OK);
		this.toggleClass(`${key}-${PlayerStatus.NOT_AVAILABLE}`, status === PlayerStatus.NOT_AVAILABLE);
		this.toggleClass(`${key}-${PlayerStatus.DEFINED}`, status === PlayerStatus.DEFINED);
	}
	
	set loading(toggle){
		this.toggleClass("loading", toggle);
	}
	
	showNotification(title, message){
		this.notificationView.update({title, message});
	}

	async loadCatalogue(data, command, type){
		if(data)
			return this.updateCatalogue(data, type);
		
		this.scrollTop();
		this.loading = true;
		try {
			const catalogue = await command();
			this.updateCatalogue(catalogue, type);
			this.nav.mergeState("catalogue", catalogue);
		} catch(error){
			this.updateCatalogue(error, type);
		}
		this.loading = false;
	}
	
	scrollTop(){
		window.scrollTo(0, 0);
	}
	
	updateCatalogue(catalogue, type){
		return this.discoveryView.update({type, catalogue});
	}
	
	search(data){
		if(!data)
			return this.nav.goHome();
		if(WebshareUtil.isSearchQuery(data.query))
			return this.nav.goWebshareSearch(data.query, data.page || 0);
		this.nav.goSccSearch(data.query);
	}
	
	selectCatalogueItem(data){
		switch(data.type){
			case CatalogueItemType.SCC_LINK:
				this.nav.goSccBrowse(data);
				break;
			case CatalogueItemType.SCC_EPISODE:
				this.nav.goSccEpisode(data);
				break;
			case CatalogueItemType.SCC_MOVIE:
				this.nav.goSccMovie(data);
				break;
			case CatalogueItemType.SCC_SEASON:
				this.nav.goSccSeason(data);
				this.scrollTop();
				break;
			case CatalogueItemType.SCC_SERIES:
				this.nav.goSccSeries(data);
				this.scrollTop();
				break;
			case CatalogueItemType.WEBSHARE_VIDEO:
				this.nav.goWebshareVideo(data);
				break;
			case CatalogueItemType.CALLBACK:
				data.callback();
				break;
		}
	}
	
	async resolveStreams(data){
		if(ItemDecorator.create(data.data).isWebshareVideo)
			data.callback(await this.api.loadWebshareStrams(data.data));
		else
			data.callback(await this.api.loadStreams(data.data));
	}
	
	async resolveStreamUrl(data){
		try {
			data.callback(await this.api.resolveStreamUrl(data.stream));
		} catch (error) {
			this.showNotification("Webshare error", error.message);
		}
	}
	
	async play(payload){
		const {player, position, data} = payload;
		const notificationTitle = player === Player.CAST ? "Cast" : "Kodi";
		try {
			if(player === Player.CAST)
				await this.api.playOnCast(data);
			else if(player === Player.KODI)
				await this.api.playOnKodi(position, data);
			const title = ItemDecorator.create(data.source).title;
			this.showNotification(`${notificationTitle} Success`, `Playing ${title}`);
		} catch(error) {
			this.showNotification(`${notificationTitle} Error`, error);
		}
	}
	
	onApiCastStatus(status){
		this.toggleApiClass("cast", status);
	}
	
	onApiKodiStatus(status){
		this.toggleApiClass("kodi", status);
	}
	
	onApiKodiStatus2(status){
		this.toggleApiClass("kodi2", status);
	}
	
	onApiWebshareStatus(status){
		this.toggleApiClass("webshare", status);
	}
	
	async onNavChange(data){
		this.ga.pageview(data.url, data.title);
		const nav = this.nav;
		const previousPath = data.previous?.path;
		const path = data.path;
		const state = data.state;
		if(nav.isSccMovie(path))
			this.api.addWatchedMovie(state.id);
		if(nav.isSccSeries(path))
			this.api.addWatchedSeries(state.id);
		
		if(nav.isSccMovie(previousPath) || nav.isSccEpisode(previousPath) || nav.isWebshareVideo(previousPath))
			return this.detailView.hide();
		if(nav.isSetup(previousPath))
			return this.setupView.hide();
		if(nav.isAbout(previousPath))
			return this.aboutView.hide();
		
		if(nav.isSetup(path))
			return this.setupView.show();
		if(nav.isAbout(path))
			return this.aboutView.show();
		if(nav.isSccWatchedMovies(path))
			return await this.loadCatalogue(null,
				async () => await this.api.loadIds(this.api.watchedMovies, data.title));
		if(nav.isSccWatchedSeries(path))
			return await this.loadCatalogue(null,
				async () => await this.api.loadIds(this.api.watchedSeries, data.title));
		if(nav.isSccMovie(path) || nav.isSccEpisode(path))
			return this.detailView.update(state);
		if(nav.isSccSeries(path))
			return await this.loadCatalogue(state.catalogue,
				async () => await this.api.loadSeasons(state.id, data.title));
		if(nav.isSccSeason(path))
			return await this.loadCatalogue(state.catalogue,
				async () => await this.api.loadEpisodes(state.id, data.title));
		if(nav.isWebshareVideo(path))
			return this.detailView.update(state);
		if(nav.isSccBrowse(path))
			return await this.loadCatalogue(state.catalogue,
				async () => await this.api.loadPath(state.url, data.title));
		
		this.discoveryView.searchQuery = state?.query || "";
		if(nav.isSccSearch(path))
			return await this.loadCatalogue(state.catalogue,
				async () => await this.api.searchScc(state.query, data.title));
		if(nav.isWebshareSearch(path))
			return await this.loadCatalogue(state.catalogue,
				async () => await this.api.searchWebshare(state.query, data.title, state.page), "webshare");
		
		this.updateCatalogue(this.createHome());
	}
}
