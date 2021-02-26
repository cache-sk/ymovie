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

	export class CatalogueItemSelected extends Base<CatalogueItemSelectedData> {}
	export class CatalogueItemFocused extends Base<CatalogueItemFocusedData> {}
	export class StreamFocused extends Base<StreamFocusedData> {}
	
	export class RequestFocus extends Base<Focus.IFocusable> {}
	export class ShowScreen extends Base<ScreenId> {}
	export class CatalogueLoaded extends Base<CatalogueLoadedData> {}
	export class SearchCatalogueLoaded extends Base<Array<Catalogue.AnyItem>> {}
	export class StreamsLoaded extends Base<StreamsLoadedData> {}
	export class Play extends Base<PlayData> {}
	export class SeekBy extends Base<number> {}
	export class SeekTo extends Base<number> {}
	export class EmulateFocusAction extends Base<Focus.Action> {}
	export class OSKKeyFocus extends Base<OSKKeyData> {}
	export class OSKKeySubmit extends Base<OSKKeyData> {}
	export class GlobalKeyDown extends Base<KeyboardEvent> {}
	export class Search extends Base<string> {}
	export class TogglePlay extends Base<undefined> {
		constructor() {
			super(undefined);
		}
	}
	
	export class BlurStreams extends Base<undefined> {
		constructor() {
			super(undefined);
		}
	}

	export type PlayData = {
		media:Media.Playable;
		stream:Media.Stream;
	}

	export type CatalogueItemSelectedData = {
		readonly data:Catalogue.AnyItem;
		readonly component:Focus.IFocusable;
		readonly element:HTMLElement;
	}

	export type CatalogueItemFocusedData = {
		readonly data:Catalogue.AnyItem;
		readonly component:Focus.IFocusable;
		readonly element:HTMLElement;
		readonly scroll:boolean;
	}

	export type StreamFocusedData = {
		readonly data:Media.Stream;
		readonly component:Focus.IFocusable;
		readonly element:HTMLElement;
	}

	export type CatalogueLoadedData = {
		readonly item:Catalogue.AnyItem;
		readonly catalogue:Array<Catalogue.AnyItem>;
	}

	export type StreamsLoadedData = {
		readonly media:Media.PlayableScc;
		readonly streams:Array<Media.Stream>;
	}

	export type OSKKeyData = {
		readonly type:OSKAction;
		readonly value:string;
	}
}
