namespace ymovie.tv.view.media {
	import Action = type.Action;
	import ClassName = util.ClassName;
	import Context = ymovie.tv.type.Context;
	import DOM = ymovie.util.DOM;
	import Focus = ymovie.tv.util.Focus;
	import Media = ymovie.type.Media;

	export abstract class MediaScreenBase extends Screen {
		protected readonly rowContainer:HTMLDivElement;
		private readonly detail:Detail;
		private lastFocusedCatalogue:Action.CatalogueItemFocusedData | undefined;
		private readonly _onCatalogueLoaded = this.onCatalogueLoaded.bind(this);

		constructor(context:Context) {
			super(context);
			this.element.classList.add("MediaScreenBase");
			this.detail = new Detail(context);
			this.rowContainer = DOM.div("rows");
			this.updateActiveFocus("rows");

			this.listen(Action.CatalogueItemFocused, this.onCatalogueItemFocused.bind(this));
			this.listen(Action.StreamFocused, this.onStreamFocused.bind(this));
			this.listen(Action.BlurStreams, this.onBlurStreams.bind(this));
			this.listen(Action.CatalogueItemSelected, this.onCatalogueItemSelected.bind(this));
		}

		activate(currentFocus:Focus.IFocusable | undefined) {
			super.activate(currentFocus);
			this.listenGlobal(Action.CatalogueLoaded, this._onCatalogueLoaded);
		}

		deactivate() {
			this.unlistenGlobal(Action.CatalogueLoaded, this._onCatalogueLoaded);
			super.deactivate();
		}

		render() {
			this.append([this.detail.render(), this.rowContainer]);
			return super.render();
		}

		protected appendCatalogue(data:RowData, requestFocus:boolean) {
			const row = new Row(data);
			DOM.append(this.rowContainer, row.render());
			const item = row.getFirst();
			if(requestFocus && item)
				this.trigger(new Action.RequestFocus(item));
		}

		protected removeCatalogues() {
			DOM.clean(this.rowContainer);
		}

		protected updateActiveFocus(value:string) {
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

		private onCatalogueLoaded(event:CustomEvent<Action.CatalogueLoadedData>) {
			this.appendCatalogue(event.detail.catalogue, true);
		}
	}
}
