namespace ymovie.tv.view.media {
	import Action = type.Action;
	import ClassName = util.ClassName;
	import DOM = ymovie.util.DOM;
	import Media = ymovie.type.Media;

	export class MediaScreen extends Screen {
		private rowContainer:HTMLDivElement;
		private detail = new Detail();
		private lastFocusedCatalogue:Action.CatalogueItemFocusedData | undefined;

		constructor() {
			super();
			this.rowContainer = DOM.div("rows");
			this.updateActiveFocus("rows");

			this.listen(Action.CatalogueItemFocused, this.onCatalogueItemFocused.bind(this));
			this.listen(Action.StreamFocused, this.onStreamFocused.bind(this));
			this.listen(Action.BlurStreams, this.onBlurStreams.bind(this));
		}

		render() {
			this.append([this.detail.render(), this.rowContainer]);
			return super.render();
		}

		appendCatalogue(data:RowData) {
			const row = new Row(data);
			row.listen(Action.CatalogueItemSelected, () => this.onItemSelected(row));
			DOM.append(this.rowContainer, row.render());

			const item = row.getFirst();
			if(item)
				this.trigger(new Action.RequestFocus(item));
		}

		updateActiveFocus(value:ActiveFocus) {
			ClassName.updateType(this.element, "focus", value);
		}

		onItemSelected(row:Row) {
			const container = this.rowContainer;
			while(container.lastChild && container.lastChild != row.element)
				container.lastChild.remove();
		}

		onCatalogueItemFocused(event:CustomEvent<Action.CatalogueItemFocusedData>) {
			this.lastFocusedCatalogue = event.detail;
			this.updateActiveFocus("rows");
			const {data, element} = event.detail;
			this.detail.update(data instanceof Media.Base ? data : undefined);

			const container = this.rowContainer;
			let className = "up";
			for(let child = container.firstElementChild; child; child = child.nextElementSibling) {
				if(child.contains(element)) {
					className = "down";
					child.classList.remove("up");
					child.classList.remove("down");
					container.style.transform = `translateY(${-(<HTMLElement>child).offsetTop}px)`;
				} else {
					child.classList.add(className);
					child.classList.remove(className == "down" ? "up" : "down");
				}
			}
		}

		onStreamFocused() {
			this.updateActiveFocus("stream");
		}

		onBlurStreams() {
			if(this.lastFocusedCatalogue)
				this.trigger(new Action.RequestFocus(this.lastFocusedCatalogue.component));
		}
	}

	type ActiveFocus = "stream" | "rows";
}
