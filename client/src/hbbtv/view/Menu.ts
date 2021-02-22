namespace ymovie.hbbtv.view {
	import Catalogue = ymovie.type.Catalogue;
	import DataComponent = ymovie.view.DataComponent;

	export class Menu extends DataComponent<HTMLDivElement, Data> {
		constructor(data:Data) {
			super("div", data);
		}

		render() {
			this.append(this.data.map(this.renderItem));
			return super.render();
		}

		renderItem(data:Catalogue.Base) {
			return new Item(data).render();
		}
	}

	type Data = Array<Catalogue.Base>;

	export class Item extends FocusableDataComponent<HTMLDivElement, Catalogue.Base> {
		constructor(data:Catalogue.Base) {
			super("div", data);
		}

		render() {
			this.append(this.data.label);
			return super.render();
		}
	}
}
