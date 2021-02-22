namespace ymovie.hbbtv.view {
	import Action = type.Action;
	import Catalogue = ymovie.type.Catalogue;
	import Focus = util.Focus;
	import Media = ymovie.type.Media;
	import Scc = ymovie.api.Scc;

	export class App extends ymovie.view.App {
		api = new api.Api();
		focus = new Focus.Manager();
		header = new Header();
		mediaScreen = new media.MediaScreen(this.menu);

		static async init(){
			const result = new App();
			await result.init();
		}

		async init():Promise<any> {
			this.api.webshareStatusChanged.add(this.onApiWebshareStatus.bind(this));

			this.listen(Action.CatalogueItemSelected, event => this.selectCatalogueItem(event.detail));

			//await this.api.init();

			this.render();
			this.element.classList.toggle("initializing", false);

			this.focus.focusedComponent = this.header.mediaComponent;

			document.addEventListener("keydown", this.onDocumentKeyDown.bind(this));
		}

		render(){
			this.append([this.header.render(), 
				this.mediaScreen.render()]);
			return super.render();
		}

		async selectCatalogueItem(item:Catalogue.AnyItem) {
			if(item instanceof Scc.CatalogueLink)
				return this.mediaScreen.appendCatalogue(await this.api.loadPath(item.url));
			if(item instanceof Media.Series)
				return this.mediaScreen.appendCatalogue(await this.api.loadSeasons(item.id));
			if(item instanceof Media.Season)
				return this.mediaScreen.appendCatalogue(await this.api.loadEpisodes(item.id));
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
			if(!action)
				return;
			const components = this.trigger(new Action.RegisterFocusable());
			const result = this.focus.executeEvent(components, {action});
			if(result)
				event.preventDefault();
		}
	}
}
