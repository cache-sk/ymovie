namespace ymovie.tv.view.media {
	import Action = type.Action;
	import ClassName = util.ClassName;
	import Context = ymovie.tv.type.Context;
	import DOM = ymovie.util.DOM;
	import Focus = ymovie.tv.util.Focus;
	import Media = ymovie.type.Media;

	export class MediaScreen extends Screen {
		private readonly rowContainer:HTMLDivElement;
		private readonly detail:Detail;
		private lastFocusedCatalogue:Action.CatalogueItemFocusedData | undefined;

		constructor(context:Context) {
			super(context);
			this.detail = new Detail(context);
			this.rowContainer = DOM.div("rows");
			this.updateActiveFocus("rows");

			this.listen(Action.CatalogueItemFocused, this.onCatalogueItemFocused.bind(this));
			this.listen(Action.StreamFocused, this.onStreamFocused.bind(this));
			this.listen(Action.BlurStreams, this.onBlurStreams.bind(this));
			this.listen(Action.CatalogueItemSelected, this.onCatalogueItemSelected.bind(this));
			this.listenGlobal(Action.SccMediaLoaded, this.onSccMediaLoaded.bind(this));
		}

		activate(currentFocus:Focus.IFocusable) {
			super.activate(currentFocus);

			if(!this.rowContainer.children.length)
				this.appendCatalogue(this.context.menu, !currentFocus);
		}

		render() {
			this.append([this.detail.render(), this.rowContainer]);
			return super.render();
		}

		private appendCatalogue(data:RowData, requestFocus:boolean) {
			const row = new Row(data);
			DOM.append(this.rowContainer, row.render());
			const item = row.getFirst();
			if(requestFocus && item)
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
			this.appendCatalogue(event.detail.media, true);
		}
	}

	type ActiveFocus = "stream" | "rows";
}
