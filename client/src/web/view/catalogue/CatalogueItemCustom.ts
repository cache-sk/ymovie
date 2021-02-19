namespace ymovie.view.catalogue {
	export class CatalogueItemCustom<T extends type.Catalogue.Base> extends CatalogueItem<T> {
		constructor(data:T){
			super(data);
			this.element.classList.add("CatalogueItemCustom");
		}
		
		render(){
			const data = this.data;
			this.element.classList.add(<string>data?.group);
			const name = util.DOM.span("name", data?.label);
			const subtitle = data instanceof type.Catalogue.SccLink && data.subtitle 
				? util.DOM.span("subtitle", data.subtitle) : null;
			this.append(util.DOM.span("title", [name, subtitle]));
			return super.render();
		}
	}
}
