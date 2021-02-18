namespace ymovie.type.Type {
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

	export type ActionResolveStreamsData = {
		data:Media.Base;
		callback:any;
	}

	export type LocationData = {
		path:string;
		sccMediaId?:string;
		webshareMediaId?:string;
		sccLinkLabel?:string;
	}

	export type PlayableStreams = {
		data:Media.Playable;
		streams:Array<type.Type.Stream>;
	}

	export type PlayableStream = {
		source:Media.Playable;
		url:string;
	}

	export type NavState = {
		state:NavStateSource;
		title:string;
		url:string;
	}

	export type NavStateSource = Catalogue.Base & NavStateCatalogue 
		| Media.Base & NavStateCatalogue 
		| NavStateSearch & NavStateCatalogue 
		| undefined;

	export type NavStateCatalogue = {
		catalogue?:Array<Catalogue.AnyItem>;
	}

	export type NavStateSearch = {
		query:string;
		page?:number;
	}
}
