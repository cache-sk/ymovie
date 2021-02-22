namespace ymovie.hbbtv.type.Action {
	import Base = ymovie.type.Action.Base;
	import Catalogue = ymovie.type.Catalogue;
	import Focus = util.Focus;

	export class RegisterFocusable extends Base<Array<Focus.IFocusable>> {
		constructor() {
			super([]);
		}
	}

	export class CatalogueItemSelected extends Base<Catalogue.AnyItem> {}
}
