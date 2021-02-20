namespace ymovie.hbbtv.view {
	import Catalogue = ymovie.type.Catalogue

	export class App extends ymovie.view.App {
		api:api.Api | undefined;
		catalogueView:CatalogueView | undefined;

		static async init(){
			const result = new App();
			await result.init();
		}

		async init():Promise<any> {
			this.api = new api.Api();

			this.catalogueView = new CatalogueView();

			this.api.webshareStatusChanged.add(this.onApiWebshareStatus.bind(this));
			await this.api.init();

			this.render();
			this.element.classList.toggle("initializing", false);
		}

		render(){
			this.append(this.updateCatalogue(this.menu));
			return super.render();
		}

		updateCatalogue(data:Array<Catalogue.Base>){
			return this.catalogueView?.update(data);
		}
	}
}
