namespace ymovie.tv.type.Action {
	import Base = ymovie.type.Action.Base;
	import Catalogue = ymovie.type.Catalogue;
	import Focus = util.Focus;
	import Media = ymovie.type.Media;
	import ScreenId = type.ScreenId;

	export class RegisterFocusable extends Base<Array<Focus.IFocusable>> {
		constructor() {
			super([]);
		}
	}

	export class CatalogueItemSelected extends Base<Catalogue.AnyItem> {}
	export class CatalogueItemFocused extends Base<CatalogueItemFocusedData> {}
	export class StreamFocused extends Base<StreamFocusedData> {}
	
	export class RequestFocus extends Base<Focus.IFocusable> {}
	export class ShowScreen extends Base<ScreenId> {}
	export class StreamsLoaded extends Base<StreamsLoadedData> {}
	export class BlurStreams extends Base<undefined> {
		constructor() {
			super(undefined);
		}
	}

	export type CatalogueItemFocusedData = {
		readonly data:Catalogue.AnyItem;
		readonly component:Focus.IFocusable;
		readonly element:HTMLElement;
	}

	export type StreamFocusedData = {
		readonly data:Media.Stream;
		readonly component:Focus.IFocusable;
		readonly element:HTMLElement;
	}

	type StreamsLoadedData = {
		readonly item:Media.PlayableScc;
		readonly streams:Array<Media.Stream>;
	}
}
