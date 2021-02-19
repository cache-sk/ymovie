/// <reference path="Nav.ts"/>

namespace ymovie.web.type.Action {
	import Catalogue = ymovie.type.Catalogue;
	import Media = ymovie.type.Media;
	import Status = ymovie.type.Status;
	import Trigger = ymovie.util.Trigger;

	export class GoBack extends Trigger.Action<undefined> {
		constructor() {
			super(undefined);
		}
	}

	export class GoHome extends Trigger.Action<boolean> {}
	export class ShowSetup extends Trigger.Action<boolean> {}
	export class ShowAbout extends Trigger.Action<boolean> {}
	export class KodiStatusUpdated extends Trigger.Action<KodiStatusUpdatedData> {}
	export class CastStatusUpdates extends Trigger.Action<Status> {}
	export class NavChanged extends Trigger.Action<NavChangeData> {}
	export class CatalogueItemSelected extends Trigger.Action<CatalogueItemSelectedData> {}
	export class ResolveStreams extends Trigger.Action<ResolveStreamsData> {}
	export class ResolveStreamUrl extends Trigger.Action<ResolveStreamUrlData> {}
	export class Play extends Trigger.Action<PlayData> {}

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
		status:Status;
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
