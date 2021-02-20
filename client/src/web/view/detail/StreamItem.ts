/// <reference path="StreamOption.ts"/>

namespace ymovie.web.view.detail {
	import DOM = ymovie.util.DOM;
	import Media = ymovie.type.Media;
	import Util = ymovie.util.Util;

	export class StreamItem extends StreamOption<Data> {
		renderInfo(){
			const data = this.data?.stream;
			if(!data)
				return undefined;
			return DOM.span("info", [
				this.add("size", Util.formatSize(data.size)),
				this.add("language", data.language),
				this.add("subtitles", data.subtitles),
				this.add("hdr", data.hdr ? "HDR" : undefined),
				this.add("3d", data.is3d ? "3D" : undefined),
				this.add("quality", `${data.width}x${data.height}`),
				this.add("codec", `${data.videoCodec}+${data.audioCodec}`),
				this.add("duration", Util.formatDuration(data.duration))]);
		}
		
		add(className:string, value:string | undefined | null):DOM.Content {
			return value ? DOM.span(className, value) : undefined;
		}
		
		onClick(){
			this.element.classList.add("loading");
			this.trigger(new type.Action.ResolveStreamUrl({stream:<Media.Stream>this.data?.stream, callback:this.onUrl.bind(this)}));
			if(this.data?.source instanceof Media.Movie)
				util.Watched.addMovie(this.data.source.id);
			if(this.data?.source instanceof Media.Episode) {
				if(this.data.source.seriesId)
					util.Watched.addSeries(this.data.source.seriesId);
				util.Watched.addEpisode(this.data.source.id);
			}
		}
		
		onUrl(url:string){
			this.element.classList.remove("loading");
			if(this.data)
				this.update({...this.data, url});
		}
	}

	type Data = {
		stream:Media.Stream;
		source:Media.Playable;
		url?:string;
	}
}
