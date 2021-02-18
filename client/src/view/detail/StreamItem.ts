/// <reference path="StreamOption.ts"/>

namespace ymovie.view.detail {
	export class StreamItem extends StreamOption<Data> {
		renderInfo(){
			const data = this.data?.stream;
			if(!data)
				return undefined;
			return util.DOM.span("info", [
				this.add("size", util.Util.formatDuration(data.size)),
				this.add("language", data.language),
				this.add("subtitles", data.subtitles),
				this.add("hdr", data.hdr ? "HDR" : undefined),
				this.add("3d", data.is3d ? "3D" : undefined),
				this.add("quality", `${data.width}x${data.height}`),
				this.add("codec", `${data.videoCodec}+${data.audioCodec}`),
				this.add("duration", util.Util.formatDuration(data.duration))]);
		}
		
		add(className:string, value:string | undefined | null):util.DOMContent {
			return value ? util.DOM.span(className, value) : undefined;
		}
		
		onClick(){
			this.element.classList.add("loading");
			this.trigger?.(new type.Action.ResolveStreamUrl({stream:<type.Media.Stream>this.data?.stream, callback:this.onUrl.bind(this)}));
			if(this.data?.source instanceof type.Media.Movie)
				util.WatchedUtil.addMovie(this.data.source.id);
			if(this.data?.source instanceof type.Media.Episode) {
				if(this.data.source.seriesId)
					util.WatchedUtil.addSeries(this.data.source.seriesId);
				util.WatchedUtil.addEpisode(this.data.source.id);
			}
		}
		
		onUrl(url:string){
			this.element.classList.remove("loading");
			if(this.data)
				this.update({...this.data, url});
		}
	}

	type Data = {
		stream:type.Media.Stream;
		source:type.Media.Playable;
		url?:string;
	}
}
