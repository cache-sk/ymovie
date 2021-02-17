/// <reference path="StreamOption.ts"/>

namespace ymovie.view.detail {
	export class StreamItem extends StreamOption<Data> {
		static create(data:Data){
			return new this(data);
		}

		renderInfo(){
			const decorator = util.StreamDecorator.create(<type.Type.Stream>this.data?.stream);
			return util.DOM.span("info", [
				this.add("size", decorator.formatSize),
				this.add("language", decorator.language),
				this.add("subtitles", decorator.subtitles),
				this.add("hdr", decorator.formatHDR),
				this.add("3d", decorator.format3D),
				this.add("quality", `${decorator.width}x${decorator.height}`),
				this.add("codec", `${decorator.videoCodec}+${decorator.audioCodec}`),
				this.add("duration", decorator.formatDuration)]);
		}
		
		add(className:string, value:string | undefined | null):util.DOMContent {
			return value ? util.DOM.span(className, value) : undefined;
		}
		
		onClick(){
			this.element.classList.add("loading");
			this.trigger?.(enums.Action.RESOLVE_STREAM_URL, {stream:this.data?.stream, callback:this.onUrl.bind(this)});
			const decorator = util.ItemDecorator.create(<type.Type.Playable>this.data?.source);
			if(decorator.isSccMovie)
				util.WatchedUtil.addMovie(decorator.id);
			if(decorator.isSccEpisode) {
				if(decorator.seriesId)
					util.WatchedUtil.addSeries(decorator.seriesId);
				util.WatchedUtil.addEpisode(decorator.id);
			}
		}
		
		onUrl(url:string){
			this.element.classList.remove("loading");
			if(this.data)
				this.update({...this.data, url});
		}
	}

	type Data = {
		stream:type.Type.Stream;
		source:type.Type.Playable;
		url?:string;
	}
}
