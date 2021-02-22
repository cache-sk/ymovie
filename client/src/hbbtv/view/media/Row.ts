namespace ymovie.hbbtv.view.media {
	import Action = type.Action;
	import Catalogue = ymovie.type.Catalogue;
	import DataComponent = ymovie.view.DataComponent;
	import Focus = util.Focus;
	import Media = ymovie.type.Media;
	import Thumbnail = ymovie.util.Thumbnail;

	export class Row extends DataComponent<HTMLDivElement, RowData> {
		constructor(data?:RowData) {
			super("div", data);
		}

		render() {
			this.clean();
			this.append(this.data?.map(this.renderItem));
			return super.render();
		}

		renderItem(data:ItemData) {
			return new Item(data).render();
		}
	}

	type ItemData = Catalogue.AnyItem;
	export type RowData = Array<ItemData> | undefined;

	class Item extends FocusableDataComponent<HTMLDivElement, ItemData> {
		constructor(data:ItemData) {
			super("div", data);
		}

		render() {
			this.clean();
			if(this.data instanceof Catalogue.Base) {
				this.append(this.data.label);
			} else if(this.data instanceof Media.Base) {
				const poster = Thumbnail.fromOriginal(this.data.poster);
				this.element.style.backgroundImage = poster ? `url(${poster})` : 'none';
			}
			return super.render();
		}

		executeFocusEvent(event:Focus.Event) {
			if(event.action == "submit") {
				this.trigger(new Action.CatalogueItemSelected(this.data));
				return true;
			}
			return false;
		}
	}
}
