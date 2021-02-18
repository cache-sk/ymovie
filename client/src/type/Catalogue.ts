namespace ymovie.type.Catalogue {
	export abstract class Base {
		readonly label:string;
		readonly group:enums.ItemGroup;

		constructor(group:enums.ItemGroup, label:string) {
			this.group = group;
			this.label = label;
		}
		
		action?:util.TriggerActionAny;
	}

	export class SccLink extends Base {
		readonly url:string;
		readonly subtitle?:string;
		readonly page?:number;

		constructor(group:enums.ItemGroup, label:string, url:string, subtitle?:string, page?:number) {
			super(group, label);
			this.url = url;
			this.subtitle = subtitle;
			this.page = page;
		}
	}

	export class Callback extends Base {
		readonly callback:(replace?:boolean) => void;

		constructor(group:enums.ItemGroup, label:string, callback:(replace?:boolean) => void) {
			super(group, label);
			this.callback = callback;
		}
	}

	export class Trigger extends Base {
		readonly subtitle:string;
		readonly action:util.TriggerActionAny;

		constructor(group:enums.ItemGroup, label:string, subtitle:string, action:util.TriggerActionAny) {
			super(group, label);
			this.subtitle = subtitle;
			this.action = action;
		}
	}

	export type AnyItem = Base | Media.Base;
}
