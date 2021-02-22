namespace ymovie.hbbtv.view.media {
	import Action = type.Action;
	import DOM = ymovie.util.DOM;
	import Media = ymovie.type.Media;

	export class MediaScreen extends Screen {
		private rowContainer:HTMLDivElement;
		private detail = new Detail();

		constructor() {
			super();
			this.rowContainer = DOM.div("rows");
		}

		render() {
			this.append([this.detail.render(), this.rowContainer]);
			return super.render();
		}

		appendCatalogue(data:RowData) {
			const row = new Row(data);
			row.listen(Action.CatalogueItemSelected, () => this.onItemSelected(row));
			row.listen(Action.CatalogueItemFocused, event => this.onItemFocused(event.detail, row));
			DOM.append(this.rowContainer, row.render());

			const item = row.getFirstItem();
			if(item)
				this.trigger(new Action.RequestFocus(item));
		}

		onItemSelected(row:Row) {
			const container = this.rowContainer;
			while(container.lastChild && container.lastChild != row.element)
				container.lastChild.remove();
		}

		onItemFocused(data:RowItemData, row:Row) {
			this.detail.update(data instanceof Media.Base ? data : undefined);

			const container = this.rowContainer;
			container.style.transform = `translateY(${-row.element.offsetTop}px)`;
			let className = "up";
			for(let elemenent = container.firstElementChild; elemenent; elemenent = elemenent.nextElementSibling) {
				if(elemenent == row.element) {
					className = "down";
					elemenent.classList.remove("up");
					elemenent.classList.remove("down");
				} else {
					elemenent.classList.add(className);
					elemenent.classList.remove(className == "down" ? "up" : "down");
				}
			}
		}
	}
}
