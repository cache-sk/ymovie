class CatalogueTrigger extends CatalogueItemCustom {
	static create(data){
		return new this(data);
	}
	
	get selectAction(){
		return this.data.action;
	}
	
	get selectData(){
		return this.data.payload;
	}
}
