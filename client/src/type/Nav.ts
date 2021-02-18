/// <reference path="Catalogue.ts"/>
/// <reference path="Media.ts"/>

namespace ymovie.type.Nav {
	export class State {
		readonly state:StateSource;
		readonly title:string;
		readonly url:string;

		constructor(state:StateSource, title:string, url:string) {
			this.state = state;
			this.title = title;
			this.url = url;
		}
	}

	export abstract class StateSearch {
		readonly query:string;
		readonly page:number;

		constructor(query:string, page:number=0) {
			this.query = query;
			this.page = page;
		}
	}

	export class StateSccSearch extends StateSearch {}
	export class StateWebshareSearch extends StateSearch {}

	export class StateSource {
		source:StateSourceData;
		catalogue:Array<type.Catalogue.AnyItem> | undefined;

		constructor(source:StateSourceData) {
			this.source = source;
		}
	}

	export type StateSourceData = Catalogue.Base | Media.Base | StateSearch | undefined;
}
