namespace ymovie.view.detail {
	export class StreamTrailer extends StreamOption<Data> {
		renderInfo(){
			const domain = new URL(<string>this.data?.trailer).hostname.split(".").splice(-2, 1);
			return util.DOM.span("info", [util.DOM.span("name", "Trailer"), util.DOM.span("domain", domain)]);
		}
		
		onClick(){
			if(this.data)
				this.update({...this.data, url:this.data?.trailer});
		}
	}

	type Data = {
		trailer:string;
		url?:string;
	}
}
