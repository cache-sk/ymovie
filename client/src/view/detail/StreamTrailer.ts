namespace ymovie.view.detail {
	import DOM = util.DOM;

	export class StreamTrailer extends StreamOption<Data> {
		renderInfo(){
			const domain = new URL(<string>this.data?.trailer).hostname.split(".").splice(-2, 1);
			return DOM.span("info", [DOM.span("name", "Trailer"), DOM.span("domain", domain)]);
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
