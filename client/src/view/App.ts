/// <reference path="base/Component.ts"/>

namespace ymovie.view {
	const Action = type.Action;
	const Catalogue = type.Catalogue;
	const Media = type.Media;
	const ApiScc = api.ApiScc;
	const DOM = util.DOM;

	export class App extends base.Component<HTMLBodyElement> {
		api:api.Api | undefined;
		nav:util.Nav | undefined;
		ga:util.GA | undefined;
		menu:Menu | undefined;
		setupView:setup.SetupView | undefined;
		aboutView:AboutView | undefined;
		discoveryView:discovery.DiscoveryView | undefined;
		detailView:detail.DetailView | undefined;
		notificationView:NotificationView | undefined;

		constructor(){
			super(document.body);
		}

		static async init(){
			const result = new App();
			await result.init();
		}
		
		async init():Promise<any> {
			// cast only works on filesystem, localhost or https (for real domains)
			// also do not redirect on IP, as there is no https alternative
			if(location.protocol === "http:" 
				&& location.hostname !== "localhost" 
				&& location.hostname !== "localhost.charlesproxy.com"
				&& !location.hostname.match(/^[\.0-9]+$/))
				return location.protocol = "https:";
			
			this.initPWA();
			this.api = new api.Api();
			this.nav = new util.Nav();
			this.ga = new util.GA();
			this.menu = {home:[
				new Catalogue.SccLink("movie", "New Movies", ApiScc.PATH_MOVIES_AIRED),
				new Catalogue.SccLink("series", "New Series", ApiScc.PATH_SERIES_AIRED),
				new Catalogue.SccLink("concert", "New Concerts", ApiScc.PATH_NEW_CONCERTS),
				new Catalogue.SccLink("fairyTale", "New Fairy Tales", ApiScc.PATH_NEW_FAIRY_TALES),
				new Catalogue.SccLink("animated", "Animated Movies", ApiScc.PATH_NEW_ANIMATED_MOVIES),
				new Catalogue.SccLink("animated", "Animated Series", ApiScc.PATH_NEW_ANIMATED_SERIES),
				new Catalogue.SccLink("movie", "New Movies CZ/SK", ApiScc.PATH_DUBBED_MOVIES_AIRED),
				new Catalogue.SccLink("series", "New Series CZ/SK", ApiScc.PATH_DUBBED_SERIES_AIRED),
				new Catalogue.SccLink("popular", "Popular Movies", ApiScc.PATH_MOVIES_POPULAR),
				new Catalogue.SccLink("popular", "Popular Series", ApiScc.PATH_SERIES_POPULAR),
				new Catalogue.SccLink("movie", "Added Movies", ApiScc.PATH_MOVIES_ADDED),
				new Catalogue.SccLink("series", "Added Series", ApiScc.PATH_SERIES_ADDED),
				new Catalogue.Callback("watched", "Watched Movies", this.nav.goSccWatchedMovies.bind(this.nav)),
				new Catalogue.Callback("watched", "Watched Series", this.nav.goSccWatchedSeries.bind(this.nav))
			]};
			
			this.setupView = new setup.SetupView(this.api);
			this.aboutView = new AboutView();
			this.discoveryView = new discovery.DiscoveryView();
			this.detailView = new detail.DetailView(this.api);
			this.notificationView = new NotificationView();

			this.listen?.(Action.GoBack, this.nav.goBack.bind(this.nav));
			this.listen?.(Action.Search, this.search.bind(this));
			this.listen?.(Action.CatalogueItemSelected, this.selectCatalogueItem.bind(this));
			this.listen?.(Action.ResolveStreams, this.resolveStreams.bind(this));
			this.listen?.(Action.ResolveStreamUrl, this.resolveStreamUrl.bind(this));
			this.listen?.(Action.GoHome, this.nav.goHome.bind(this.nav));
			this.listen?.(Action.ShowSetup, this.nav.goSetup.bind(this.nav));
			this.listen?.(Action.ShowAbout, this.nav.goAbout.bind(this.nav));
			this.listen?.(Action.Play, this.play.bind(this));
			
			this.ga.init();
			
			this.nav.listen?.(Action.NavChanged, this.onNavChange.bind(this));
			this.nav.init();
			
			this.api.listen?.(Action.CastStatusUpdates, this.onApiCastStatus.bind(this));
			this.api.listen?.(Action.KodiStatusUpdated, this.onApiKodiStatus.bind(this));
			this.api.listen?.(Action.WebshareStatusUpdated, this.onApiWebshareStatus.bind(this));
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
			if(!this.api || !this.nav || !this.menu)
				return;

			const {path, sccMediaId, webshareMediaId, sccLinkLabel} = this.nav.locationData;
			const sccLink = sccLinkLabel && this.menu.home.find(item => sccLinkLabel == this.nav?.safePath(item.label));
			if(sccMediaId)
				return this.nav.goReplaceMedia(<type.Media.Base>await this.api.loadMedia(sccMediaId));
			if(webshareMediaId)
				return this.nav.goReplaceMedia(await this.api.loadWebshareMedia(webshareMediaId));
			if(sccLink && sccLink instanceof Catalogue.SccLink)
				return this.nav.goSccBrowse(sccLink);
			
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
				this.updateCatalogue(this.menu?.home, "home"),
				this.detailView?.render(),
				this.setupView?.render(),
				this.aboutView?.render(),
				this.notificationView?.render()]);
			return super.render();
		}

		toggleClass(key:string, toggle:boolean){
			this.element.classList.toggle(key, toggle);
		}
		
		toggleApiClass(key:string, status:enums.Status){
			this.toggleClass(`${key}-${enums.Status.OK}`, status === enums.Status.OK);
			this.toggleClass(`${key}-${enums.Status.NOT_AVAILABLE}`, status === enums.Status.NOT_AVAILABLE);
			this.toggleClass(`${key}-${enums.Status.DEFINED}`, status === enums.Status.DEFINED);
		}
		
		set loading(toggle:boolean) {
			this.toggleClass("loading", toggle);
		}
		
		showNotification(title:string, message:string) {
			this.notificationView?.update({title, message});
		}

		async loadCatalogue(data:Array<type.Catalogue.AnyItem> | undefined, command:() => Promise<Array<type.Catalogue.AnyItem> | undefined>, type?:string):Promise<any> {
			if(data)
				return this.updateCatalogue(data, type);
			
			this.scrollTop();
			this.loading = true;
			try {
				const catalogue = await command();
				this.updateCatalogue(catalogue || [], type);
				this.nav?.assignCatalogue(catalogue);
			} catch(error){
				this.updateCatalogue(error, type);
			}
			this.loading = false;
		}
		
		scrollTop(){
			window.scrollTo(0, 0);
		}
		
		updateCatalogue(catalogue:Array<type.Catalogue.AnyItem> | Error | undefined, type?:string){
			return this.discoveryView?.update({type, catalogue});
		}
		
		search(data:type.Action.SearchData){
			if(!data.query)
				return this.nav?.goHome();
			if(this.api?.isWebshareSearchQuery(data.query))
				return this.nav?.goWebshareSearch(data.query, data.page || 0);
			this.nav?.goSccSearch(data.query);
		}
		
		selectCatalogueItem(data:type.Catalogue.AnyItem){
			if(data instanceof Catalogue.SccLink) {
				this.nav?.goSccBrowse(data);
			} else if(data instanceof Media.Episode) {
				this.nav?.goSccEpisode(data);
			} else if(data instanceof Media.Movie) {
				this.nav?.goSccMovie(data);
			} else if(data instanceof Media.Season) {
				this.nav?.goSccSeason(data);
				this.scrollTop();
			} else if(data instanceof Media.Series) {
				this.nav?.goSccSeries(data);
				this.scrollTop();
			} else if(data instanceof Media.Webshare) {
				this.nav?.goWebshareVideo(data);
			} else if(data instanceof Catalogue.Callback) {
				data.callback();
			}
		}
		
		async resolveStreams(data:type.Action.ResolveStreamsData){
			if(!this.api)
				return;
			if(data.data instanceof Media.Webshare)
				data.callback(await this.api.loadWebshareStreams(data.data));
			else
				data.callback(await this.api.loadStreams(data.data));
		}
		
		async resolveStreamUrl(data:type.Action.ResolveStreamUrlData){
			try {
				if(this.api)
					data.callback(await this.api.resolveStreamUrl(data.stream));
			} catch (error) {
				this.showNotification("Webshare error", error.message);
			}
		}
		
		async play(payload:type.Action.PlayData){
			const {player, media, url} = payload;
			const notificationTitle = player instanceof type.Player.Cast ? "Cast" : "Kodi";
			try {
				if(this.api && player instanceof type.Player.Cast)
					await this.api.playOnCast(media, url);
				else if(this.api && player instanceof type.Player.Kodi)
					await this.api.playOnKodi(player.position, url);
				this.showNotification(`${notificationTitle} Success`, `Playing ${media.title}`);
			} catch(error) {
				this.showNotification(`${notificationTitle} Error`, error);
			}
		}
		
		onApiCastStatus(status:enums.Status){
			this.toggleApiClass("cast", status);
		}
		
		onApiKodiStatus(data:type.Action.KodiStatusUpdatedData){
			const key = "kodi" + (data.position === 1 ? "" : "2");
			this.toggleApiClass(key, data.status);
		}
		
		onApiWebshareStatus(status:enums.Status){
			this.toggleApiClass("webshare", status);
		}
		
		async onNavChange(data:type.Action.NavChangeData){
			if(!this.api || !this.nav || !this.detailView || !this.setupView || !this.aboutView || !this.discoveryView || !this.menu)
				return;

			this.ga?.pageview(data.url, data.title);
			const nav = this.nav;
			const previousPath = data.previous?.path || "";
			const path = data.path || "";
			const state = data.state;
			const isDetail = (path:string) => nav.isSccMovie(path) || nav.isSccEpisode(path) || nav.isWebshareVideo(path);
			
			/** Short circuit here on popup closing to avoid flickering catalogue */
			if(isDetail(previousPath) && !isDetail(path))
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
				return await this.loadCatalogue(undefined,
					async () => await this.api?.loadIds(util.Watched.movies, data.title));
			if(nav.isSccWatchedSeries(path))
				return await this.loadCatalogue(undefined,
					async () => await this.api?.loadIds(util.Watched.series, data.title));
			if(isDetail(path))
				return this.detailView.update({detail:<type.Media.Playable>state.source, list:<Array<type.Catalogue.AnyItem>>this.discoveryView.data?.catalogue});
			if(nav.isSccSeries(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.loadSeasons((<type.Media.Series>state.source).id, data.title));
			if(nav.isSccSeason(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.loadEpisodes((<type.Media.Episode>state.source).id, data.title));
			if(nav.isSccBrowse(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.loadPath(<string>(<type.Catalogue.SccLink>state.source).url, data.title));
			
			this.discoveryView.searchQuery = (<type.Nav.StateSearch>state.source)?.query || "";
			if(nav.isSccSearch(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.searchScc((<type.Nav.StateSearch>state.source).query, data.title));
			if(nav.isWebshareSearch(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.searchWebshare((<type.Nav.StateSearch>state.source).query, data.title, <number>(<type.Nav.StateSearch>state.source).page), "webshare");
			
			this.updateCatalogue(this.menu.home, "home");
		}
	}

	type Menu = {
		home:Array<type.Catalogue.Base>;
	}
}
