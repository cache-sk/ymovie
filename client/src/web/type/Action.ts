/// <reference path="Nav.ts"/>

namespace ymovie.web.type.Action {
	import TriggerAction = util.Trigger.Action;

	export class GoBack extends TriggerAction<undefined> {
		constructor() {
			super(undefined);
		}
	}

	export class GoHome extends TriggerAction<boolean> {}
	export class ShowSetup extends TriggerAction<boolean> {}
	export class ShowAbout extends TriggerAction<boolean> {}
	export class KodiStatusUpdated extends TriggerAction<KodiStatusUpdatedData> {}
	export class WebshareStatusUpdated extends TriggerAction<enums.Status> {}
	export class CastStatusUpdates extends TriggerAction<enums.Status> {}
	export class NavChanged extends TriggerAction<NavChangeData> {}
	export class CatalogueItemSelected extends TriggerAction<CatalogueItemSelectedData> {}
	export class ResolveStreams extends TriggerAction<ResolveStreamsData> {}
	export class ResolveStreamUrl extends TriggerAction<ResolveStreamUrlData> {}
	export class Play extends TriggerAction<PlayData> {}

	export class NavChangeData extends Nav.State {
		path:string;
		previous?:NavChangeData;

		constructor(state:Nav.StateSource, title:string, url:string, path:string, previous?:NavChangeData) {
			super(state, title, url);
			this.path = path;
			this.previous = previous;
		}
	}

	export type PlayData = {
		player:Player.Base;
		media:Media.Playable;
		url:string;
	}

	export type KodiStatusUpdatedData = {
		position:number;
		status:enums.Status;
	}

	export type ResolveStreamsData = {
		data:Media.Playable;
		callback:(list:Array<Media.Stream>) => void;
	}

	export type ResolveStreamUrlData = {
		stream:Media.Stream; 
		callback:(url:string) => void;
	}

	export type CatalogueItemSelectedData = {
		item:Catalogue.AnyItem;
		replace?:boolean;
	}
}
