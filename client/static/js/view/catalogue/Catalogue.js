class Catalogue extends ymovie.view.base.DataComponent {
	constructor(){
		super("div");
	}

	render(){
		this.clean();
		this.element.classList.toggle("error", false);
		this.element.classList.toggle("empty", false);
		const watched = WatchedUtil.getMap();
		if(ymovie.util.Util.isArray(this.data) && this.data.length){
			this.append(this.data.map(data => this.renderItem(data, watched)));
		} else if(ymovie.util.Util.isError(this.data)) {
			this.append(ymovie.util.DOM.p(null, `Error: ${this.data.message}`));
			this.element.classList.toggle("error", true);
		} else {
			this.append(ymovie.util.DOM.p(null, "No results"));
			this.element.classList.toggle("empty", true);
		}
		return super.render();
	}
	
	renderItem(data, watched){
		switch(data.type){
			case ymovie.type.Type.CatalogueItemType.CALLBACK:
			case ymovie.type.Type.CatalogueItemType.SCC_LINK:
				return CatalogueItemCustom.create(data).render();
			case ymovie.type.Type.CatalogueItemType.TRIGGER:
				return CatalogueTrigger.create(data).render();
			default:
				return CatalogueMedia.create(data, watched).render();
		}
	}
}
