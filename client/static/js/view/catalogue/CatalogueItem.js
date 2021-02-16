class CatalogueItem extends ymovie.view.base.Component {
	constructor(data){
		super("div");
		this.element.classList.add("CatalogueItem");
		this.data = data;
		this.element.addEventListener("click", 
			event => this.trigger(this.selectAction, this.selectData));
	}
	
	get selectAction(){
		return Action.SELECT_CATALOGUE_ITEM;
	}
	
	get selectData(){
		return this.data;
	}
}
