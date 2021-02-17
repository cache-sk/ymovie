/// <reference path="../util/Trigger.ts"/>

namespace ymovie.type.Action {
	export class GoBack extends util.TriggerAction<undefined> {}
	export class GoHome extends util.TriggerAction<boolean> {}
	export class ShowSetup extends util.TriggerAction<boolean> {}
	export class ShowAbout extends util.TriggerAction<boolean> {}
	export class KodiStatusUpdated extends util.TriggerAction<KodiStatusUpdatedData> {}
	export class WebshareStatusUpdated extends util.TriggerAction<enums.PlayerStatus> {}
	export class CastStatusUpdates extends util.TriggerAction<enums.PlayerStatus> {}
	export class Search extends util.TriggerAction<SearchData> {}
	export class NavChanged extends util.TriggerAction<type.Type.NavChange> {}
	export class CatalogueItemSelected extends util.TriggerAction<Type.AnyCatalogueItem> {}
	export class ResolveStreams extends util.TriggerAction<ResolveStreamsData> {}
	export class ResolveStreamUrl extends util.TriggerAction<ResolveStreamUrlData> {}
	export class Play extends util.TriggerAction<PlayData> {}

	export type PlayData = {
		player:enums.Player;
		position?:number;
		data:type.Type.PlayableStream;
	}

	export type KodiStatusUpdatedData = {
		position:number;
		status:enums.PlayerStatus;
	}

	export type SearchData = {
		query?:string;
		page?:number;
	}

	export type ResolveStreamsData = {
		data:type.Type.Playable;
		callback:(list:Array<type.Type.Stream>) => void;
	}

	export type ResolveStreamUrlData = {
		stream:type.Type.Stream; 
		callback:(url:string) => void;
	}
}
