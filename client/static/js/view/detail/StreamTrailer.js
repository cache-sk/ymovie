class StreamTrailer extends StreamOption {
	static create(data){
		return new this(data);
	}
	
	renderInfo(){
		const domain = new URL(this.data.trailer).hostname.split(".").splice(-2, 1);
		return DOM.span("info", [DOM.span("name", "Trailer"), DOM.span("domain", domain)]);
	}
	
	onClick(){
		this.update({...this.data, url:this.data.trailer});
	}
}
