namespace ymovie.view.detail {
	export class StreamItem extends StreamOption {
		static create(data:any){
			return new this(data);
		}

		renderInfo(){
			const decorator = util.StreamDecorator.create(this.data.stream);
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
		
		add(className:string, value:string | undefined | null){
			if(value)
				return util.DOM.span(className, value);
		}
		
		onClick(){
			this.element.classList.add("loading");
			this.trigger?.(enums.Action.RESOLVE_STREAM_URL, {stream:this.data.stream, callback:this.onUrl.bind(this)});
			const decorator = util.ItemDecorator.create(this.data.source);
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
			this.update({...this.data, url});
		}
	}
}
