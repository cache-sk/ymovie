class StreamItem extends StreamOption {
	static create(data){
		return new this(data);
	}

	renderInfo(){
		const decorator = ymovie.util.StreamDecorator.create(this.data.stream);
		return ymovie.util.DOM.span("info", [
			this.add("size", decorator.formatSize),
			this.add("language", decorator.language),
			this.add("subtitles", decorator.subtitles),
			this.add("hdr", decorator.formatHDR),
			this.add("3d", decorator.format3D),
			this.add("quality", `${decorator.width}x${decorator.height}`),
			this.add("codec", `${decorator.videoCodec}+${decorator.audioCodec}`),
			this.add("duration", decorator.formatDuration)]);
	}
	
	add(className, value){
		if(value)
			return ymovie.util.DOM.span(className, value);
	}
	
	onClick(){
		this.element.classList.add("loading");
		this.trigger(Action.RESOLVE_STREAM_URL, {stream:this.data.stream, callback:this.onUrl.bind(this)});
		const decorator = ymovie.util.ItemDecorator.create(this.data.source);
		if(decorator.isSccMovie)
			WatchedUtil.addMovie(decorator.id);
		if(decorator.isSccEpisode) {
			WatchedUtil.addSeries(decorator.seriesId);
			WatchedUtil.addEpisode(decorator.id);
		}
	}
	
	onUrl(url){
		this.element.classList.remove("loading");
		this.update({...this.data, url});
	}
}
