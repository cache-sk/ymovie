namespace ymovie.view.catalogue {
	export class CatalogueItemCustom extends CatalogueItem<type.Type.CatalogueItem> {
		static create(data:type.Type.CatalogueItem){
			return new this(data);
		}
		
		constructor(data:type.Type.CatalogueItem){
			super(data);
			this.element.classList.add("CatalogueItemCustom");
		}
		
		render(){
			const data = this.data;
			this.element.classList.add(<string>data?.group);
			const name = util.DOM.span("name", data?.label);
			const subtitle = data instanceof type.Type.CatalogueItemSccLink && data.subtitle 
				? util.DOM.span("subtitle", data.subtitle) : null;
			this.append(util.DOM.span("title", [name, subtitle]));
			return super.render();
		}
	}
}
