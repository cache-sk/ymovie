namespace ymovie.view.catalogue {
	export class CatalogueTrigger extends CatalogueItemCustom<type.Catalogue.Trigger> {
		get selectAction():util.TriggerActionAny {
			return <util.TriggerActionAny>this.data?.action;
		}
	}
}
