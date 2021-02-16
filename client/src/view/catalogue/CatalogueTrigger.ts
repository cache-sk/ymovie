namespace ymovie.view.catalogue {
	export class CatalogueTrigger extends CatalogueItemCustom {
		static create(data:type.Type.CatalogueItem){
			return new this(data);
		}
		
		get selectAction() {
			return this.data?.action;
		}
		
		get selectData():any {
			return this.data?.payload;
		}
	}
}
