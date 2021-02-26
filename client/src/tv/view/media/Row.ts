namespace ymovie.tv.view.media {
	import Action = type.Action;
	import Catalogue = ymovie.type.Catalogue;
	import DataComponent = ymovie.view.DataComponent;
	import DOM = ymovie.util.DOM;
	import Focus = util.Focus;
	import Media = ymovie.type.Media;
	import Scc = ymovie.api.Scc;
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
			if(event.detail.scroll)
				this.element.style.transform = `translateX(${-event.detail.element.offsetLeft}px)`;
		}
	}

	export type RowItemData = Catalogue.AnyItem;
	export type RowData = Array<RowItemData>;

	class Item extends FocusableDataComponent<HTMLDivElement, RowItemData> {
		static DEFAULT_POSTER_URL = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 8.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5zm9 .5l-2.519 4-2.481-1.96-4 5.96h14l-5-8zm8-4v14h-20v-14h20zm2-2h-24v18h24v-18z"/></svg>';

		private _onImageError = this.onImageError.bind(this);
		private scrollOnFocus = true;

		constructor(data:RowItemData) {
			super("div", data);
			this.listenGlobal(Action.CatalogueLoaded, this.onCatalogueLoaded.bind(this));
			this.listenGlobal(Action.StreamsLoaded, this.onStreamsLoaded.bind(this));
			this.element.addEventListener("click", this.onClick.bind(this));
			this.element.addEventListener("wheel", this.onWheel.bind(this));
			this.element.addEventListener("mouseenter", this.onMouseEnter.bind(this));
		}

		render() {
			this.clean();
			if(this.data instanceof Scc.CatalogueLink) {
				this.append(DOM.span("label", this.data.label));
				this.element.classList.add(this.data.group);
			} else if(this.data instanceof Media.Base) {
				this.append(this.renderPoster(this.data.poster));
			}
			return super.render();
		}

		renderPoster(poster:string | undefined) {
			const url = Thumbnail.fromOriginal(poster) || Item.DEFAULT_POSTER_URL;
			const result = DOM.img(undefined, url);
			result.width = 100; // mute consoloe warning
			result.loading = "lazy";
			result.addEventListener("error", this._onImageError);
			result.classList.toggle("missing", !poster);
			return result;
		}

		focus() {
			super.focus();
			this.trigger(new Action.CatalogueItemFocused({data:this.data, component:this, element:this.element, scroll:this.scrollOnFocus}));
		}

		submit() {
			this.element.classList.add("loading");
			this.trigger(new Action.CatalogueItemSelected({data:this.data, component:this, element:this.element}));
		}

		executeFocusEvent(event:Focus.Event) {
			if(event.action == "submit") {
				this.submit();
				return true;
			}
			return false;
		}

		modifyFocusEvent(event:Focus.Event):Focus.Event {
			if(event.action === "back")
				return {action:"up", repeated:event.repeated};
			return event;
		}
		
		onImageError(event:Event) {
			const image = <HTMLImageElement>(event).target;
			image.removeEventListener("error", this._onImageError);
			image.src = Item.DEFAULT_POSTER_URL;
			image.classList.add("error");
		}

		onCatalogueLoaded(event:CustomEvent<Action.CatalogueLoadedData>) {
			if(this.data === event.detail.item)
				this.element.classList.remove("loading");
		}

		onStreamsLoaded(event:CustomEvent<Action.StreamsLoadedData>) {
			if(this.data === event.detail.media)
				this.element.classList.remove("loading");
		}

		onClick() {
			this.focus();
			this.submit();
		}

		onWheel(event:WheelEvent) {
			var action:Focus.Action = event.deltaY < 0 ? "left" : "right";
			this.trigger(new Action.EmulateFocusAction(action));
		}

		onMouseEnter() {
			this.scrollOnFocus = false;
			this.trigger(new Action.RequestFocus({component:this, element:this.element}));
			this.scrollOnFocus = true;
		}
	}
}
