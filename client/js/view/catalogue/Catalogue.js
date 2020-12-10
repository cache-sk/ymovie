class Catalogue extends Component {
	constructor(){
		super("div");
	}

	render(){
		this.clean();
		this.element.classList.toggle("error", false);
		this.element.classList.toggle("empty", false);
		const watched = WatchedUtil.getMap();
		if(Util.isArray(this.data) && this.data.length){
			this.append(this.data.map(data => this.renderItem(data, watched)));
		} else if(Util.isError(this.data)) {
			this.append(DOM.p(null, `Error: ${this.data.message}`));
			this.element.classList.toggle("error", true);
		} else {
			this.append(DOM.p(null, "No results"));
			this.element.classList.toggle("empty", true);
		}
		return super.render();
	}
	
	renderItem(data, watched){
		switch(data.type){
			case CatalogueItemType.CALLBACK:
			case CatalogueItemType.SCC_LINK:
				return CatalogueItemCustom.create(data).render();
			case CatalogueItemType.TRIGGER:
				return CatalogueTrigger.create(data).render();
			default:
				return CatalogueMedia.create(data, watched).render();
		}
	}
}
