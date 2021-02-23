namespace ymovie.tv.view.media {
	import Action = type.Action;
	import Catalogue = ymovie.type.Catalogue;
	import DataComponent = ymovie.view.DataComponent;
	import Focus = util.Focus;
	import Media = ymovie.type.Media;
	import Thumbnail = ymovie.util.Thumbnail;

	export class Row extends DataComponent<HTMLDivElement, RowData> {
		private first:Item | undefined;

		constructor(data:RowData) {
			super("div", data);

			this.listen(Action.CatalogueItemFocused, this.onCatalogueItemFocused.bind(this));
		}

		getFirst():Item | undefined {
			return this.first;
		}

		render() {
			this.clean();
			this.first = undefined;
			for(const data of this.data) {
				const item = new Item(data);
				if(!this.first) this.first = item;
				this.append(item.render());
			}
			return super.render();
		}


		onCatalogueItemFocused(event:CustomEvent<Action.CatalogueItemFocusedData>) {
			const element = event.detail.element;
			this.element.style.transform = `translateX(${-element.offsetLeft}px)`;
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
			this.trigger(new Action.CatalogueItemFocused({data:this.data, component:this, element:this.element}));
		}

		executeFocusEvent(event:Focus.Event) {
			if(event.action == "submit") {
				this.trigger(new Action.CatalogueItemSelected(this.data));
				return true;
			}
			return false;
		}

		modifyFocusEvent(event:Focus.Event):Focus.Event {
			if(event.action === "back")
				return {action:"up", repeated:event.repeated};
			return event;
		}
	}
}
