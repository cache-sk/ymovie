namespace ymovie.tv.view.search {
	import Action = ymovie.tv.type.Action;
	import Catalogue = ymovie.type.Catalogue;
	import Context = ymovie.tv.type.Context;
	import DOM = ymovie.util.DOM;

	export class SearchScreen extends media.MediaScreenBase {
		private readonly osk = new OSK();
		private readonly input = DOM.input(undefined, "q", "", "Search query");
		private searchTimeout:number | undefined;
		private readonly searchTimeoutInterval = 1000;
		private lastSearch = "";
		private _onGlobalKeyDown = this.delaySearchTimeout.bind(this);
		private _onSearchCatalogueLoaded = this.onSearchCatalogueLoaded.bind(this);

		constructor(context:Context) {
			super(context);
			this.updateActiveFocus("osk");
			
			this.osk.listen(Action.OSKKeySubmit, this.onOSKKeySubmit.bind(this));
			this.osk.listen(Action.Focused, this.onOSKKeyFocused.bind(this));
			this.input.addEventListener("input", this.resetSearchTimeout.bind(this));
			this.input.addEventListener("change", this.resetSearchTimeout.bind(this));
		}

		activate(focus:boolean) {
			super.activate(focus);
			this.listenGlobal(Action.GlobalKeyDown, this._onGlobalKeyDown);
			this.listenGlobal(Action.SearchCatalogueLoaded, this._onSearchCatalogueLoaded);
		}

		deactivate() {
			this.stopSearchTimeout();
			this.unlistenGlobal(Action.GlobalKeyDown, this._onGlobalKeyDown);
			this.unlistenGlobal(Action.SearchCatalogueLoaded, this._onSearchCatalogueLoaded);
			super.deactivate();
		}

		render() {
			this.append([this.osk.render(), this.input]);
			return super.render();
		}

		stopSearchTimeout() {
			clearTimeout(this.searchTimeout);
			this.searchTimeout = undefined;
		}

		resetSearchTimeout() {
			this.stopSearchTimeout();
			if(this.input.value.length > 2 && this.input.value != this.lastSearch)
				this.searchTimeout = setTimeout(this.onSearch.bind(this), this.searchTimeoutInterval);
		}

		delaySearchTimeout() {
			if(this.searchTimeout)
				this.resetSearchTimeout();
		}

		private onOSKKeyFocused() {
			this.updateActiveFocus("osk");
		}

		private onOSKKeySubmit(event:CustomEvent<Action.OSKKeyData>) {
			const {type, value} = event.detail;
			const input = this.input;
			if(type === "del")
				input.value = input.value.substr(0, Math.max(input.value.length - 1, 0));
			else if(type === "space")
				input.value += " ";
			else
				input.value += value;
			this.resetSearchTimeout();
		}

		private onSearch() {
			this.stopSearchTimeout();
			this.removeCatalogues();
			this.lastSearch = this.input.value;
			this.trigger(new Action.Search(this.input.value));
		}

		private onSearchCatalogueLoaded(event:CustomEvent<Array<Catalogue.AnyItem>>) {
			this.appendCatalogue(event.detail, false);
		}
	}
}
