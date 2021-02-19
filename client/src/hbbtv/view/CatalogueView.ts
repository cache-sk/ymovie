namespace ymovie.hbbtv.view {
	import Catalogue = type.Catalogue;

	export class CatalogueView extends DataComponent<HTMLDivElement, Data> {
		constructor() {
			super("div");
		}

		render() {
			return super.render();
		}
	}

	type Data = Array<Catalogue.Base>;
}
