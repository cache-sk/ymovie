namespace ymovie.web.view.catalogue {
	export class Catalogue extends DataComponent<HTMLDivElement, Array<type.Catalogue.AnyItem> | Error | undefined> {
		constructor(){
			super("div");
		}

		render(){
			this.clean();
			this.element.classList.toggle("error", false);
			this.element.classList.toggle("empty", false);
			const watched = util.Watched.getMap();
			const items = <Array<type.Catalogue.AnyItem> | undefined>this.data;
			const error = <Error | undefined>this.data;
			if(util.Util.isArray(this.data) && items?.length){
				this.append(items.map(data => this.renderItem(data, watched)));
			} else if(util.Util.isError(this.data)) {
				this.append(util.DOM.p(undefined, `Error: ${error?.message}`));
				this.element.classList.toggle("error", true);
			} else {
				this.append(util.DOM.p(undefined, "No results"));
				this.element.classList.toggle("empty", true);
			}
			return super.render();
		}
		
		renderItem(data:type.Catalogue.AnyItem, watched:util.WatchedMap){
			if(data instanceof type.Catalogue.Callback)
				return new CatalogueItemCustom(data).render();
			if(data instanceof type.Catalogue.SccLink)
				return new CatalogueItemCustom(data).render();
			if(data instanceof type.Catalogue.Trigger)
				return new CatalogueTrigger(data).render();
			if(data instanceof type.Media.Base)
				return new CatalogueMedia(data, watched).render();
			return undefined;
		}
	}
}
