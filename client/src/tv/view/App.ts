namespace ymovie.tv.view {
	import Action = type.Action;
	import Focus = util.Focus;
	import Media = ymovie.type.Media;
	import Nav = util.Nav;
	import Scc = ymovie.api.Scc;
	import ScreenId = type.ScreenId;

	export class App extends ymovie.view.App {
		api = new api.Api();
		nav = new Nav.Manager();
		focus = new Focus.Manager();
		header = new Header();
		mediaScreen = new media.MediaScreen();
		searchScreen = new search.SearchScreen();
		setupScreen = new setup.SetupScreen();
		aboutScreen = new about.AboutScreen();

		static async init(){
			const result = new App();
			await result.init();
		}

		async init():Promise<any> {
			this.api.webshareStatusChanged.add(this.onApiWebshareStatus.bind(this));

			this.listen(Action.CatalogueItemSelected, this.onCatalogueItemSelected.bind(this));
			this.listen(Action.RequestFocus, event => this.requestFocus(event.detail));
			this.listen(Action.ShowScreen, event => this.showScreen(event.detail));

			//await this.api.init();

			this.nav.changed.add(this.onNavChange.bind(this));
			this.nav.init();

			this.render();
			this.mediaScreen.appendCatalogue(this.menu);
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
			if(nav.isAbout(path))
				screenId = "about";
			else if(nav.isSearch(path))
				screenId = "search";
			else if(nav.isSetup(path))
				screenId = "setup";

			util.ClassName.updateType(this.element, "screen", screenId);
		}

		onDocumentKeyDown(event:KeyboardEvent) {
			let action:Focus.Action | undefined;
			if(event.key == "ArrowLeft")
				action = "left";
			else if(event.key == "ArrowRight")
				action = "right";
			else if(event.key == "ArrowUp")
				action = "up";
			else if(event.key == "ArrowDown")
				action = "down";
			else if(event.key == "Enter")
				action = "submit";
			else if(event.key == "Escape")
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
