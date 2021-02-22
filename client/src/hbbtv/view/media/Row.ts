namespace ymovie.hbbtv.view.media {
	import Action = type.Action;
	import Catalogue = ymovie.type.Catalogue;
	import DataComponent = ymovie.view.DataComponent;
	import Focus = util.Focus;
	import Media = ymovie.type.Media;
	import Thumbnail = ymovie.util.Thumbnail;

	export class Row extends DataComponent<HTMLDivElement, RowData> {
		private firstItem:Item | undefined;

		constructor(data:RowData) {
			super("div", data);
		}

		getFirstItem():Item | undefined {
			return this.firstItem;
		}

		render() {
			this.clean();
			const items = this.data.map(this.createItem.bind(this));
			this.firstItem = items.length ? items[0] : undefined;
			this.append(items.map(item => item.render()));
			return super.render();
		}

		createItem(data:RowItemData) {
			const result = new Item(data);
			result.listen(Action.CatalogueItemFocused, () => this.highlight(result));
			return result;
		}

		highlight(item:Item) {
			this.element.style.transform = `translateX(${-item.element.offsetLeft}px)`;
		}
	}

	export type RowItemData = Catalogue.AnyItem;
	export type RowData = Array<RowItemData>;

	class Item extends FocusableDataComponent<HTMLDivElement, RowItemData> {
		constructor(data:RowItemData) {
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

		focus() {
			super.focus();
			this.trigger(new Action.CatalogueItemFocused(this.data));
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
