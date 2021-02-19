/// <reference path="../util/Trigger.ts"/>

namespace ymovie.type.Action {
	import TriggerAction = util.Trigger.Action;

	export class Search extends TriggerAction<SearchData> {}
	export class WebshareStatusUpdated extends TriggerAction<Status> {}

	export type SearchData = {
		query?:string;
		page?:number;
	}
}
