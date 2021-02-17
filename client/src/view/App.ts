/// <reference path="base/Component.ts"/>

namespace ymovie.view {
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
				util.CatalogueUtil.createSccLink("movie", "New Movies", api.ApiScc.PATH_MOVIES_AIRED),
				util.CatalogueUtil.createSccLink("series", "New Series", api.ApiScc.PATH_SERIES_AIRED),
				util.CatalogueUtil.createSccLink("concert", "New Concerts", api.ApiScc.PATH_NEW_CONCERTS),
				util.CatalogueUtil.createSccLink("fairyTale", "New Fairy Tales", api.ApiScc.PATH_NEW_FAIRY_TALES),
				util.CatalogueUtil.createSccLink("animated", "Animated Movies", api.ApiScc.PATH_NEW_ANIMATED_MOVIES),
				util.CatalogueUtil.createSccLink("animated", "Animated Series", api.ApiScc.PATH_NEW_ANIMATED_SERIES),
				util.CatalogueUtil.createSccLink("movie", "New Movies CZ/SK", api.ApiScc.PATH_DUBBED_MOVIES_AIRED),
				util.CatalogueUtil.createSccLink("series", "New Series CZ/SK", api.ApiScc.PATH_DUBBED_SERIES_AIRED),
				util.CatalogueUtil.createSccLink("popular", "Popular Movies", api.ApiScc.PATH_MOVIES_POPULAR),
				util.CatalogueUtil.createSccLink("popular", "Popular Series", api.ApiScc.PATH_SERIES_POPULAR),
				util.CatalogueUtil.createSccLink("movie", "Added Movies", api.ApiScc.PATH_MOVIES_ADDED),
				util.CatalogueUtil.createSccLink("series", "Added Series", api.ApiScc.PATH_SERIES_ADDED),
				util.CatalogueUtil.createCallback("watched", "Watched Movies", this.nav.goSccWatchedMovies.bind(this.nav)),
				util.CatalogueUtil.createCallback("watched", "Watched Series", this.nav.goSccWatchedSeries.bind(this.nav))
			]};
			
			this.setupView = new setup.SetupView(this.api);
			this.aboutView = new AboutView();
			this.discoveryView = new discovery.DiscoveryView();
			this.detailView = new detail.DetailView(this.api);
			this.notificationView = new NotificationView();

			this.listen?.(enums.Action.BACK, this.nav.goBack.bind(this.nav));
			this.listen?.(enums.Action.SEARCH, this.search.bind(this));
			this.listen?.(enums.Action.SELECT_CATALOGUE_ITEM, this.selectCatalogueItem.bind(this));
			this.listen?.(enums.Action.RESOLVE_STREAMS, this.resolveStreams.bind(this));
			this.listen?.(enums.Action.RESOLVE_STREAM_URL, this.resolveStreamUrl.bind(this));
			this.listen?.(enums.Action.HOME, this.nav.goHome.bind(this.nav));
			this.listen?.(enums.Action.SETUP, this.nav.goSetup.bind(this.nav));
			this.listen?.(enums.Action.ABOUT, this.nav.goAbout.bind(this.nav));
			this.listen?.(enums.Action.PLAY, this.play.bind(this));
			
			this.ga.init();
			
			this.nav.listen?.(ymovie.enums.Action.CHANGE, this.onNavChange.bind(this));
			this.nav.init();
			
			this.api.listen?.(ymovie.enums.Action.CAST_STATUS_UPDATED, this.onApiCastStatus.bind(this));
			this.api.listen?.(this.api.getKodiStatusKey(1), this.onApiKodiStatus.bind(this));
			this.api.listen?.(this.api.getKodiStatusKey(2), this.onApiKodiStatus2.bind(this));
			this.api.listen?.(ymovie.enums.Action.WEBSHARE_STATUS_UPDATED, this.onApiWebshareStatus.bind(this));
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

			const {path, sccMediaId, webshareMediaId, sccLinkLabel} = <type.Type.LocationData>this.nav.locationData;
			const sccLink = sccLinkLabel && this.menu.home.find(item => sccLinkLabel == this.nav?.safePath(item.label));
			if(sccMediaId)
				return this.nav.goReplaceMedia(await this.api.loadMedia(sccMediaId));
			if(webshareMediaId)
				return this.nav.goReplaceMedia(await this.api.loadWebshareMedia(webshareMediaId));
			if(sccLink)
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
			ymovie.util.DOM.append(document.body, ymovie.util.DOM.script("https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"));
		}
		
		initAnalytics(){
			ymovie.util.DOM.append(document.body, ymovie.util.DOM.script("https://www.google-analytics.com/analytics.js"));
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
		
		toggleApiClass(key:string, status:enums.PlayerStatus){
			this.toggleClass(`${key}-${ymovie.enums.PlayerStatus.OK}`, status === ymovie.enums.PlayerStatus.OK);
			this.toggleClass(`${key}-${ymovie.enums.PlayerStatus.NOT_AVAILABLE}`, status === ymovie.enums.PlayerStatus.NOT_AVAILABLE);
			this.toggleClass(`${key}-${ymovie.enums.PlayerStatus.DEFINED}`, status === ymovie.enums.PlayerStatus.DEFINED);
		}
		
		set loading(toggle:boolean) {
			this.toggleClass("loading", toggle);
		}
		
		showNotification(title:string, message:string) {
			this.notificationView?.update({title, message});
		}

		async loadCatalogue(data:Array<type.Type.AnyCatalogueItem> | undefined, command:() => Promise<Array<type.Type.AnyCatalogueItem> | undefined>, type?:string):Promise<any> {
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
		
		updateCatalogue(catalogue:Array<type.Type.AnyCatalogueItem> | Error | undefined, type?:string){
			return this.discoveryView?.update({type, catalogue});
		}
		
		search(data:SearchData){
			if(!data)
				return this.nav?.goHome();
			if(ymovie.util.WebshareUtil.isSearchQuery(data.query))
				return this.nav?.goWebshareSearch(data.query, data.page || 0);
			this.nav?.goSccSearch(data.query);
		}
		
		selectCatalogueItem(data:type.Type.CatalogueItem | type.Type.Item){
			switch(data.type){
				case type.Type.CatalogueItemType.SCC_LINK:
					this.nav?.goSccBrowse(<type.Type.CatalogueItem>data);
					break;
				case type.Type.CatalogueItemType.SCC_EPISODE:
					this.nav?.goSccEpisode(<type.Type.Episode>data);
					break;
				case type.Type.CatalogueItemType.SCC_MOVIE:
					this.nav?.goSccMovie(<type.Type.Movie>data);
					break;
				case type.Type.CatalogueItemType.SCC_SEASON:
					this.nav?.goSccSeason(<type.Type.Season>data);
					this.scrollTop();
					break;
				case type.Type.CatalogueItemType.SCC_SERIES:
					this.nav?.goSccSeries(<type.Type.Series>data);
					this.scrollTop();
					break;
				case type.Type.CatalogueItemType.WEBSHARE_VIDEO:
					this.nav?.goWebshareVideo(<type.Type.Item>data);
					break;
				case type.Type.CatalogueItemType.CALLBACK:
					(<type.Type.CatalogueItem>data).callback?.();
					break;
			}
		}
		
		async resolveStreams(data:ResolveStreamsData){
			if(!this.api)
				return;
			if(ymovie.util.ItemDecorator.create(data.data).isWebshareVideo)
				data.callback(await this.api.loadWebshareStreams(data.data));
			else
				data.callback(await this.api.loadStreams(data.data));
		}
		
		async resolveStreamUrl(data:ResolveStreamUrlData){
			try {
				if(this.api)
					data.callback(await this.api.resolveStreamUrl(data.stream));
			} catch (error) {
				this.showNotification("Webshare error", error.message);
			}
		}
		
		async play(payload:PlayPayload){
			const {player, position, data} = payload;
			const notificationTitle = player === enums.Player.CAST ? "Cast" : "Kodi";
			try {
				if(this.api && player === enums.Player.CAST)
					await this.api.playOnCast(data);
				else if(this.api && player === enums.Player.KODI)
					await this.api.playOnKodi(<number>position, data);
				const title = util.ItemDecorator.create(data.source).title;
				this.showNotification(`${notificationTitle} Success`, `Playing ${title}`);
			} catch(error) {
				this.showNotification(`${notificationTitle} Error`, error);
			}
		}
		
		onApiCastStatus(status:enums.PlayerStatus){
			this.toggleApiClass("cast", status);
		}
		
		onApiKodiStatus(status:enums.PlayerStatus){
			this.toggleApiClass("kodi", status);
		}
		
		onApiKodiStatus2(status:enums.PlayerStatus){
			this.toggleApiClass("kodi2", status);
		}
		
		onApiWebshareStatus(status:enums.PlayerStatus){
			this.toggleApiClass("webshare", status);
		}
		
		async onNavChange(data:type.Type.NavChange){
			if(!this.api || !this.nav || !this.detailView || !this.setupView || !this.aboutView || !this.discoveryView || !this.menu)
				return;

			this.ga?.pageview(data.url, data.title);
			const nav = this.nav;
			const previousPath = data.previous?.path;
			const path = data.path;
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
					async () => await this.api?.loadIds(util.WatchedUtil.movies, data.title));
			if(nav.isSccWatchedSeries(path))
				return await this.loadCatalogue(undefined,
					async () => await this.api?.loadIds(util.WatchedUtil.series, data.title));
			if(isDetail(path))
				return this.detailView.update({detail:<type.Type.Playable>state, list:<Array<type.Type.AnyCatalogueItem>>this.discoveryView.data?.catalogue});
			if(nav.isSccSeries(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.loadSeasons((<type.Type.Series>state).id, data.title));
			if(nav.isSccSeason(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.loadEpisodes((<type.Type.Episode>state).id, data.title));
			if(nav.isSccBrowse(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.loadPath(<string>(<type.Type.CatalogueItem>state).url, data.title));
			
			this.discoveryView.searchQuery = (<type.Type.NavStateSearch>state)?.query || "";
			if(nav.isSccSearch(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.searchScc((<type.Type.NavStateSearch>state).query, data.title));
			if(nav.isWebshareSearch(path))
				return await this.loadCatalogue(state?.catalogue,
					async () => await this.api?.searchWebshare((<type.Type.NavStateSearch>state).query, data.title, <number>(<type.Type.CatalogueItem>state).page), "webshare");
			
			this.updateCatalogue(this.menu.home, "home");
		}
	}

	type Menu = {
		home:Array<type.Type.CatalogueItem>;
	}

	type SearchData = {
		query:string;
		page:number;
	}

	type ResolveStreamsData = {
		data:type.Type.Playable;
		callback:(list:Array<type.Type.Stream>) => void;
	}

	type ResolveStreamUrlData = {
		stream:type.Type.Stream; 
		callback:(url:string) => void;
	}

	type PlayPayload = {
		player:enums.Player;
		position?:number;
		data:type.Type.PlayableStream;
	}
}
