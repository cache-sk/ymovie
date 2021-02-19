namespace ymovie.hbbtv.view {
	import Catalogue = ymovie.type.Catalogue;
	import DataComponent = ymovie.view.DataComponent;

	export class CatalogueView extends DataComponent<HTMLDivElement, Data> {
		constructor() {
			super("div");
		}

		render() {
			this.append(this.data?.map(this.renderItem));
			return super.render();
		}

		renderItem(data:Catalogue.Base) {
			return new CatalogueRowView().update({source:data});
		}
	}

	type Data = Array<Catalogue.Base>;
}
