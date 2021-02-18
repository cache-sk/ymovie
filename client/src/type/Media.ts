namespace ymovie.type.Media {
	export abstract class Base {
		readonly id:string; // = "ae15"

		title?:string; // = "Avatar";
		longTitle?:string;
		rating?:string; // = 7.1
		poster?:string; // = "http://xyz..."

		constructor(id:string) {
			this.id = id;
		}
	}

	export abstract class Scc extends Base {
		isCZSK?:boolean;
		year?:string; // = 2020
		posterThumbnail?:string;
	}

	export class Season extends Scc {
		seriesId?:string;
		seriesTitle?:string; // = "Simsons"
		seasonNumber?:number; // = 2
	}

	export class Series extends Scc {}

	export abstract class PlayableScc extends Scc {
		plot?:string; // = "Abc. Def."
		trailers?:Array<string>; // = ["http://xyz..."]
		mpaa?:number; // = 12
		studio?:string; // = "Romulus"
		services?:Type.Services; //
		streamCount?:number; // = 12
		originalTitle?:string; // = "Abc"
		genres?:string; // = "Comedy, Drama"
		directors?:string; // = "A, B, C";
		cast?:string; // = "A, B, C";
	}

	export class Movie extends PlayableScc {}

	export class Episode extends PlayableScc {
		subtitle?:string;
		seriesId?:string;
		seriesTitle?:string; // = "Simsons"
		seasonNumber?:number; // = 4
		episodeNumber?:number; // = 3
	}

	export class Webshare extends Base {
		size?:number;
	}

	export type Playable = PlayableScc | Webshare;
}
