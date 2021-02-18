/// <reference path="../util/Trigger.ts"/>
/// <reference path="Nav.ts"/>

namespace ymovie.type.Action {
	export class GoBack extends util.TriggerAction<undefined> {}
	export class GoHome extends util.TriggerAction<boolean> {}
	export class ShowSetup extends util.TriggerAction<boolean> {}
	export class ShowAbout extends util.TriggerAction<boolean> {}
	export class KodiStatusUpdated extends util.TriggerAction<KodiStatusUpdatedData> {}
	export class WebshareStatusUpdated extends util.TriggerAction<enums.Status> {}
	export class CastStatusUpdates extends util.TriggerAction<enums.Status> {}
	export class Search extends util.TriggerAction<SearchData> {}
	export class NavChanged extends util.TriggerAction<NavChangeData> {}
	export class CatalogueItemSelected extends util.TriggerAction<Catalogue.AnyItem> {}
	export class ResolveStreams extends util.TriggerAction<ResolveStreamsData> {}
	export class ResolveStreamUrl extends util.TriggerAction<ResolveStreamUrlData> {}
	export class Play extends util.TriggerAction<PlayData> {}

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

	export type SearchData = {
		query?:string;
		page?:number;
	}

	export type ResolveStreamsData = {
		data:type.Media.Playable;
		callback:(list:Array<type.Media.Stream>) => void;
	}

	export type ResolveStreamUrlData = {
		stream:type.Media.Stream; 
		callback:(url:string) => void;
	}
}
