namespace ymovie.view.catalogue {
	export class Catalogue extends base.DataComponent<HTMLDivElement, Array<type.Type.AnyCatalogueItem> | Error | undefined> {
		constructor(){
			super("div");
		}

		render(){
			this.clean();
			this.element.classList.toggle("error", false);
			this.element.classList.toggle("empty", false);
			const watched = ymovie.util.WatchedUtil.getMap();
			const items = <Array<type.Type.AnyCatalogueItem> | undefined>this.data;
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
		
		renderItem(data:type.Type.AnyCatalogueItem, watched:util.WatchedMap){
			if(data instanceof type.Type.CatalogueItemCallback)
				return CatalogueItemCustom.create(data).render();
			if(data instanceof type.Type.CatalogueItemSccLink)
				return CatalogueItemCustom.create(data).render();
			if(data instanceof type.Type.CatalogueItemTrigger)
				return CatalogueTrigger.create(data).render();
			if(data instanceof type.Type.Item)
				return CatalogueMedia.create(data, watched).render();
			return undefined;
		}
	}
}
