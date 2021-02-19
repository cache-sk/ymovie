namespace ymovie.web.view.catalogue {
	import TCatalogue = ymovie.type.Catalogue;
	import DataComponent = ymovie.view.DataComponent
	import DOM = ymovie.util.DOM;
	import Media = ymovie.type.Media;
	import Util = ymovie.util.Util;

	export class Catalogue extends DataComponent<HTMLDivElement, Array<TCatalogue.AnyItem> | Error | undefined> {
		constructor(){
			super("div");
		}

		render(){
			this.clean();
			this.element.classList.toggle("error", false);
			this.element.classList.toggle("empty", false);
			const watched = util.Watched.getMap();
			const items = <Array<TCatalogue.AnyItem> | undefined>this.data;
			const error = <Error | undefined>this.data;
			if(Util.isArray(this.data) && items?.length){
				this.append(items.map(data => this.renderItem(data, watched)));
			} else if(Util.isError(this.data)) {
				this.append(DOM.p(undefined, `Error: ${error?.message}`));
				this.element.classList.toggle("error", true);
			} else {
				this.append(DOM.p(undefined, "No results"));
				this.element.classList.toggle("empty", true);
			}
			return super.render();
		}
		
		renderItem(data:TCatalogue.AnyItem, watched:util.WatchedMap){
			if(data instanceof TCatalogue.Callback)
				return new CatalogueItemCustom(data).render();
			if(data instanceof TCatalogue.SccLink)
				return new CatalogueItemCustom(data).render();
			if(data instanceof TCatalogue.Trigger)
				return new CatalogueTrigger(data).render();
			if(data instanceof Media.Base)
				return new CatalogueMedia(data, watched).render();
			return undefined;
		}
	}
}
