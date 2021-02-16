class CatalogueItemCustom extends CatalogueItem {
	static create(data){
		return new this(data);
	}
	
	constructor(data){
		super(data);
		this.element.classList.add("CatalogueItemCustom");
	}
	
	render(){
		const data = this.data;
		this.element.classList.add(data.group);
		const name = ymovie.util.DOM.span("name", data.label);
		const subtitle = data.subtitle ? ymovie.util.DOM.span("subtitle", data.subtitle) : null;
		this.append(ymovie.util.DOM.span("title", [name, subtitle]));
		return super.render();
	}
}
