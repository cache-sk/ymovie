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
			this.listen(Action.CatalogueItemSelected, this.onCatalogueItemSelected.bind(this));
			this.listenGlobal(Action.SccMediaLoaded, this.onSccMediaLoaded.bind(this));
		}

		render() {
			this.append([this.detail.render(), this.rowContainer]);
			return super.render();
		}

		appendCatalogue(data:RowData) {
			const row = new Row(data);
			DOM.append(this.rowContainer, row.render());
			const item = row.getFirst();
			if(item)
				this.trigger(new Action.RequestFocus(item));
		}

		private updateActiveFocus(value:ActiveFocus) {
			ClassName.updateType(this.element, "focus", value);
		}

		private onCatalogueItemSelected(event:CustomEvent<Action.CatalogueItemSelectedData>) {
			const element = event.detail.element;
			const container = this.rowContainer;
			while(container.lastChild && !container.lastChild.contains(element))
				container.lastChild.remove();
		}

		private onCatalogueItemFocused(event:CustomEvent<Action.CatalogueItemFocusedData>) {
			const {data, element} = event.detail;
			this.lastFocusedCatalogue = event.detail;
			this.updateActiveFocus("rows");
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

		private onStreamFocused() {
			this.updateActiveFocus("stream");
		}

		private onBlurStreams() {
			if(this.lastFocusedCatalogue)
				this.trigger(new Action.RequestFocus(this.lastFocusedCatalogue.component));
		}

		private onSccMediaLoaded(event:CustomEvent<Action.SccMediaLoadedData>) {
			this.appendCatalogue(event.detail.media);
		}
	}

	type ActiveFocus = "stream" | "rows";
}
