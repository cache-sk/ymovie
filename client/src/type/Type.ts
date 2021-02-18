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

	export type PlayableStream = {
		source:Media.Playable;
		url:string;
	}
}
