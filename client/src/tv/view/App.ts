namespace ymovie.tv.view {
	import Action = type.Action;
	import Focus = util.Focus;
	import Media = ymovie.type.Media;
	import Nav = util.Nav;
	import Scc = ymovie.api.Scc;
	import ScreenId = type.ScreenId;

	export class App extends ymovie.view.App {
		readonly api = new api.Api();
		readonly nav = new Nav.Manager();
		readonly focus = new Focus.Manager();
		readonly header = new Header();
		readonly context:type.Context = {deviceId:this.api.deviceId, menu:this.menu};
		readonly mediaScreen = new media.MediaScreen(this.context);
		readonly searchScreen = new search.SearchScreen(this.context);
		readonly setupScreen = new setup.SetupScreen(this.context);
		readonly aboutScreen = new about.AboutScreen(this.context);

		static async init(){
			const result = new App();
			await result.init();
		}

		async init():Promise<any> {
			this.api.webshareStatusChanged.add(this.onApiWebshareStatus.bind(this));

			this.listen(Action.CatalogueItemSelected, this.onCatalogueItemSelected.bind(this));
			this.listen(Action.RequestFocus, event => this.requestFocus(event.detail));
			this.listen(Action.ShowScreen, event => this.showScreen(event.detail));

			await this.api.init();

			this.nav.changed.add(this.onNavChange.bind(this));
			this.nav.init();

			this.render();
			this.initDeeplink();
			this.element.classList.toggle("initializing", false);

			document.addEventListener("keydown", this.onDocumentKeyDown.bind(this));
		}

		initDeeplink(){
			const nav = this.nav;
			const path = nav.currentPath;
			if(nav.isAbout(path))
				return nav.goAbout();
			if(nav.isSearch(path))
				return nav.goSearch();
			if(nav.isSetup(path))
				return nav.goSetup();
			this.nav.goHome();
		}

		render(){
			this.append([this.mediaScreen.render(), 
				this.searchScreen.render(),
				this.setupScreen.render(),
				this.aboutScreen.render(),
				this.header.render()]);
			return super.render();
		}

		async onCatalogueItemSelected(event:CustomEvent<Action.CatalogueItemSelectedData>) {
			const {data} = event.detail;
			if(data instanceof Scc.CatalogueLink)
				return this.trigger(new Action.SccMediaLoaded({item:data, media:await this.api.loadPath(data.url)}));
			if(data instanceof Media.Series)
				return this.trigger(new Action.SccMediaLoaded({item:data, media:await this.api.loadSeasons(data.id)}));
			if(data instanceof Media.Season)
				return this.trigger(new Action.SccMediaLoaded({item:data, media:await this.api.loadEpisodes(data.id)}));
			if(data instanceof Media.PlayableScc)
				return this.trigger(new Action.StreamsLoaded({media:data, streams:await this.api.loadStreams(data)}));
			return;
		}

		ensureFocus(component:Focus.IFocusable) {
			if(!this.focus.focusedComponent)
				this.requestFocus(component);
		}

		requestFocus(component:Focus.IFocusable) {
			this.focus.focusedComponent = component;
		}

		showScreen(id:ScreenId) {
			const nav = this.nav;
			if(id === "about")
				return nav.goAbout();
			if(id === "search")
				return nav.goSearch();
			if(id === "setup")
				return nav.goSetup();
			return nav.goHome();
		}

		onNavChange(data:Nav.ChangeData) {
			const nav = this.nav;
			const path = data.path;
			let screenId:ScreenId = "media";
			if(nav.isAbout(path)) {
				screenId = "about";
				this.aboutScreen.activate(!this.focus.focusedComponent);
				this.ensureFocus(this.header.about);
			} else if(nav.isSearch(path)) {
				screenId = "search";
				this.searchScreen.activate(!this.focus.focusedComponent);
				this.ensureFocus(this.header.search);
			} else if(nav.isSetup(path)) {
				screenId = "setup";
				this.setupScreen.activate(!this.focus.focusedComponent);
				this.ensureFocus(this.header.setup);
			} else {
				screenId = "media";
				this.mediaScreen.activate(!this.focus.focusedComponent);
				this.ensureFocus(this.header.media);
			}

			util.ClassName.updateType(this.element, "screen", screenId);
		}

		onDocumentKeyDown(event:KeyboardEvent) {
			let action:Focus.Action | undefined;
			if(event.key == "ArrowLeft" || event.code == "Digit4")
				action = "left";
			else if(event.key == "ArrowRight" || event.code == "Digit6")
				action = "right";
			else if(event.key == "ArrowUp" || event.code == "Digit2")
				action = "up";
			else if(event.key == "ArrowDown" || event.code == "Digit8")
				action = "down";
			else if(event.key == "Enter" || event.code == "Digit5")
				action = "submit";
			else if(event.key == "Escape" || event.code == "Digit0")
				action = "back";
			else if(event.key == "Backspace")
				action = "back";
			if(!action)
				return;
			const components = this.trigger(new Action.RegisterFocusable());
			const result = this.focus.executeEvent(components, {action});
			if(result)
				event.preventDefault();
		}
	}
}
