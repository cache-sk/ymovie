namespace ymovie.type.Media {
	export abstract class Base {
		readonly id:string;

		title?:string;
		longTitle?:string;
		rating?:string;
		poster?:string;

		constructor(id:string) {
			this.id = id;
		}
	}

	export abstract class Scc extends Base {
		isCZSK?:boolean;
		year?:string;
		posterThumbnail?:string;
	}

	export class Season extends Scc {
		seriesId?:string;
		seriesTitle?:string;
		seasonNumber?:number;
	}

	export class Series extends Scc {}

	export abstract class PlayableScc extends Scc {
		plot?:string;
		trailers?:Array<string>;
		mpaa?:number;
		studio?:string;
		services?:Type.Services;
		streamCount?:number;
		originalTitle?:string;
		genres?:string;
		directors?:string;
		cast?:string;
	}

	export class Movie extends PlayableScc {}

	export class Episode extends PlayableScc {
		subtitle?:string;
		seriesId?:string;
		seriesTitle?:string;
		seasonNumber?:number;
		episodeNumber?:number;
	}

	export class Webshare extends Base {
		size?:number;
	}

	export type Playable = PlayableScc | Webshare;
}
