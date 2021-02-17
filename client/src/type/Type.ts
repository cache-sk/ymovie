namespace ymovie.type.Type {
	export type Item = {
		id:string; // = "ae15"
		poster:string; // = "http://xyz..."
		type:CatalogueItemType; // = CatalogueItemType.SCC_MOVIE
		title:string; // = "Avatar";
		year?:number; // = 2020
		rating?:number; // = 7.1
		isCZSK?:boolean;

		size?:number;
	}

	export type WebshareItem = Item & {
		ratingPositive?:number;
		ratingNegative?:number;
	}

	export type Season = Item & {
		seriesId?:string;
		seriesTitle?:string; // = "Simsons"
		seasonNumber?:number; // = 2
	}

	export type Series = Item;

	export type Playable = Item & {
		plot?:string; // = "Abc. Def."
		trailers?:Array<string>; // = ["http://xyz..."]
		mpaa?:number; // = 12
		studio?:string; // = "Romulus"
		services?:Services; //
		streamCount?:number; // = 12
		originalTitle?:string; // = "Abc"
		genres?:string; // = "Comedy, Drama"
		directors:string; // = "A, B, C";
		cast?:string; // = "A, B, C";
	}

	export type Movie = Playable;

	export type Episode = Playable & {
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

	export type CatalogueItem = {
		type:CatalogueItemType;
		label:string;
		group:string;
		url?:string;
		subtitle?:string;
		page?:number;
		callback?:(replace?:boolean) => void;
		action?:enums.Action;
		payload?:any;
	}

	export enum CatalogueItemType {
		CALLBACK = 1,
		SCC_EPISODE = 2,
		SCC_LINK = 3,
		SCC_MOVIE = 4,
		SCC_SEASON = 5,
		SCC_SERIES = 6,
		TRIGGER = 7,
		WEBSHARE_VIDEO = 8
	}

	export type AnyCatalogueItem = CatalogueItem | Item;

	export type ActionResolveStreamsData = {
		data:Item;
		callback:any;
	}

	export type ActionPlayPayload = {
		player:enums.Player;
		position?:number;
		data:{url:string};
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
		//streams:Array<type.Type.Stream>;
		trailer?:string;
		url?:string;
	}

	export type NavState = {
		state:NavStateSource;
		title:string;
		url:string;
	}

	export type NavStateSource = CatalogueItem & NavStateCatalogue | Item & NavStateCatalogue | NavStateSearch & NavStateCatalogue | undefined;

	export type NavStateCatalogue = {
		catalogue?:Array<type.Type.AnyCatalogueItem>;
	}

	export type NavStateSearch = {
		query:string;
	}

	export type NavChange = NavState & {
		path:string;
		previous:NavChange;
	}
}
