namespace ymovie.hbbtv.view.media {
	import Action = type.Action;
	import DataComponent = ymovie.view.DataComponent;

	export class MediaScreen extends DataComponent<HTMLDivElement, Data> {
		constructor(data:Data) {
			super("div", data);

			this.appendCatalogue(data);
		}

		appendCatalogue(data:RowData) {
			const row = new Row(data);
			row.listen(Action.CatalogueItemSelected, () => this.removeCataloguesAfter(row));
			this.append(row.render());
		}

		removeCataloguesAfter(row:Row) {
			while(this.element.lastChild && this.element.lastChild != row.element)
				this.element.lastChild.remove();
		}
	}

	type Data = RowData;
}
