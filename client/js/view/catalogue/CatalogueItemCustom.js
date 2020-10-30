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
		const name = DOM.span("name", data.label);
		const subtitle = data.subtitle ? DOM.span("subtitle", data.subtitle) : null;
		this.append(DOM.span("title", [name, subtitle]));
		return super.render();
	}
}
