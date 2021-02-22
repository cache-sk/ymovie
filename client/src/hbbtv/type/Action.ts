namespace ymovie.hbbtv.type.Action {
	import Base = ymovie.type.Action.Base;
	import Catalogue = ymovie.type.Catalogue;
	import Focus = util.Focus;
	import ScreenId = type.ScreenId;

	export class RegisterFocusable extends Base<Array<Focus.IFocusable>> {
		constructor() {
			super([]);
		}
	}

	export class CatalogueItemSelected extends Base<Catalogue.AnyItem> {}
	export class CatalogueItemFocused extends Base<Catalogue.AnyItem> {}
	export class RequestFocus extends Base<Focus.IFocusable> {}
	export class ShowScreen extends Base<ScreenId> {}
}
