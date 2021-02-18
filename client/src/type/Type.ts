namespace ymovie.type.Type {
	export abstract class Item {
		readonly id:string; // = "ae15"

		title?:string; // = "Avatar";
		longTitle?:string;
		rating?:string; // = 7.1
		poster?:string; // = "http://xyz..."

		constructor(id:string) {
			this.id = id;
		}
	}

	export class SccItem extends Item {
		isCZSK?:boolean;
		year?:string; // = 2020
		posterThumbnail?:string;
	}

	export class WebshareItem extends Item {
		size?:number;
		formatSize?:string;
	}

	export type Playable = PlayableSccItem | WebshareItem;

	export class Season extends SccItem {
		seriesId?:string;
		seriesTitle?:string; // = "Simsons"
		seasonNumber?:number; // = 2
	}

	export class Series extends SccItem {
	}

	export abstract class PlayableSccItem extends SccItem {
		plot?:string; // = "Abc. Def."
		trailers?:Array<string>; // = ["http://xyz..."]
		mpaa?:number; // = 12
		studio?:string; // = "Romulus"
		services?:Services; //
		streamCount?:number; // = 12
		originalTitle?:string; // = "Abc"
		genres?:string; // = "Comedy, Drama"
		directors?:string; // = "A, B, C";
		cast?:string; // = "A, B, C";
	}

	export class Movie extends PlayableSccItem {

	}

	export class Episode extends PlayableSccItem {
		subtitle?:string;
		seriesId?:string;
		seriesTitle?:string; // = "Simsons"
		seasonNumber?:number; // = 4
		episodeNumber?:number; // = 3
	}

	export type Services = {
		csfd?:number; // = 787059
		imdb?:number; // = 6285944
		trakt?:number; // = 473980
		tmdb?:number; // = 456
	}

	export type Stream = {
		size:number;
		language?:string;
		subtitles?:string;
		width:number;
		height:number;
		videoCodec?:string;
		audioCodec?:string;
		duration:number;
		ident:string;
		hdr?:boolean;
		is3d?:boolean;
	}

	export abstract class CatalogueItem {
		readonly label:string;
		readonly group:enums.ItemGroup;

		constructor(group:enums.ItemGroup, label:string) {
			this.group = group;
			this.label = label;
		}
		
		action?:util.TriggerActionAny;
	}

	export class CatalogueItemSccLink extends CatalogueItem {
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

	export class CatalogueItemCallback extends CatalogueItem {
		readonly callback:(replace?:boolean) => void;

		constructor(group:enums.ItemGroup, label:string, callback:(replace?:boolean) => void) {
			super(group, label);
			this.callback = callback;
		}
	}

	export class CatalogueItemTrigger extends CatalogueItem {
		readonly subtitle:string;
		readonly action:util.TriggerActionAny;

		constructor(group:enums.ItemGroup, label:string, subtitle:string, action:util.TriggerActionAny) {
			super(group, label);
			this.subtitle = subtitle;
			this.action = action;
		}
	}

	export type AnyCatalogueItem = CatalogueItem | Item;

	export type ActionResolveStreamsData = {
		data:Item;
		callback:any;
	}

	export type LocationData = {
		path:string;
		sccMediaId?:string;
		webshareMediaId?:string;
		sccLinkLabel?:string;
	}

	export type PlayableStreams = {
		data:type.Type.Playable;
		streams:Array<type.Type.Stream>;
	}

	export type PlayableStream = {
		source:type.Type.Playable;
		url:string;
	}

	export type NavState = {
		state:NavStateSource;
		title:string;
		url:string;
	}

	export type NavStateSource = CatalogueItem & NavStateCatalogue 
		| Item & NavStateCatalogue 
		| NavStateSearch & NavStateCatalogue 
		| undefined;

	export type NavStateCatalogue = {
		catalogue?:Array<type.Type.AnyCatalogueItem>;
	}

	export type NavStateSearch = {
		query:string;
		page?:number;
	}
}
