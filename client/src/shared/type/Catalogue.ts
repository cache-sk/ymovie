namespace ymovie.type.Catalogue {
	export abstract class Base {
		readonly label:string;
		readonly group:ItemType;

		constructor(group:ItemType, label:string) {
			this.group = group;
			this.label = label;
		}
		
		action?:util.Trigger.ActionAny;
	}

	export class SccLink extends Base {
		readonly url:string;
		readonly subtitle?:string;
		readonly page?:number;

		constructor(group:ItemType, label:string, url:string, subtitle?:string, page?:number) {
			super(group, label);
			this.url = url;
			this.subtitle = subtitle;
			this.page = page;
		}
	}

	export class Callback extends Base {
		readonly callback:(replace?:boolean) => void;

		constructor(group:ItemType, label:string, callback:(replace?:boolean) => void) {
			super(group, label);
			this.callback = callback;
		}
	}

	export class Trigger extends Base {
		readonly subtitle:string;
		readonly action:util.Trigger.ActionAny;

		constructor(group:ItemType, label:string, subtitle:string, action:util.Trigger.ActionAny) {
			super(group, label);
			this.subtitle = subtitle;
			this.action = action;
		}
	}

	export type AnyItem = Base | Media.Base;

	export type ItemType = "movie" | "series" | "folder" | "concert" | "fairyTale" | "animated" | "popular" | "watched";
}
