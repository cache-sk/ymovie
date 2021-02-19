namespace ymovie.hbbtv.view {
	import Catalogue = type.Catalogue;

	export class CatalogueRowView extends DataComponent<HTMLDivElement, Data> {
		constructor() {
			super("div");
		}

		render() {
			this.append(this.data?.source.label);
			return super.render();
		}
	}

	type Data = {
		source:Catalogue.Base;
		data?:Array<Catalogue.AnyItem>;
	}
}