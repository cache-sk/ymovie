class StreamNA extends StreamOption {
	static create(){
		return new this(null);
	}
	
	get url(){
		return null;
	}
	
	renderInfo(){
		return DOM.span("info", DOM.span("name", "No streams available."));
	}
	
	onClick(){
	}
}
