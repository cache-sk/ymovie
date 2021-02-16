class StreamNA extends StreamOption {
	static create(){
		return new this(null);
	}
	
	get url(){
		return null;
	}
	
	renderInfo(){
		return ymovie.util.DOM.span("info", ymovie.util.DOM.span("name", "No streams available."));
	}
	
	onClick(){
	}
}
