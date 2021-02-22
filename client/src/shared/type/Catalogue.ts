namespace ymovie.type.Catalogue {
	export abstract class Base {
		readonly label:string;
		readonly group:ItemType;

		constructor(group:ItemType, label:string) {
			this.group = group;
			this.label = label;
		}
	}

	export class Callback extends Base {
		readonly callback:(replace?:boolean) => void;

		constructor(group:ItemType, label:string, callback:(replace?:boolean) => void) {
			super(group, label);
			this.callback = callback;
		}
	}

	export type AnyItem = Base | Media.Base;

	export type ItemType = "movie" | "series" | "folder" | "concert" | "fairyTale" | "animated" | "popular" | "watched";
}
