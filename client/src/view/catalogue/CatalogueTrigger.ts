namespace ymovie.view.catalogue {
	export class CatalogueTrigger extends CatalogueItemCustom {
		static create(data:type.Type.CatalogueItem){
			return new this(data);
		}
		
		get selectAction():util.TriggerActionAny {
			return <util.TriggerActionAny>this.data?.action;
		}
	}
}
