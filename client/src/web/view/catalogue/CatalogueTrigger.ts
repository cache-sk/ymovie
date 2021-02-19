namespace ymovie.web.view.catalogue {
	import Catalogue = ymovie.type.Catalogue;
	import Trigger = ymovie.util.Trigger;

	export class CatalogueTrigger extends CatalogueItemCustom<Catalogue.Trigger> {
		get selectAction():Trigger.ActionAny {
			return <Trigger.ActionAny>this.data?.action;
		}
	}
}
