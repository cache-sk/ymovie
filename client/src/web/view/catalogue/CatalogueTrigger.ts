namespace ymovie.web.view.catalogue {
	export class CatalogueTrigger extends CatalogueItemCustom<type.Catalogue.Trigger> {
		get selectAction():util.Trigger.ActionAny {
			return <util.Trigger.ActionAny>this.data?.action;
		}
	}
}
