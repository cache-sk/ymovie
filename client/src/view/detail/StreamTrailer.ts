namespace ymovie.view.detail {
	export class StreamTrailer extends StreamOption {
		static create(data:any){
			return new this(data);
		}
		
		renderInfo(){
			const domain = new URL(this.data.trailer).hostname.split(".").splice(-2, 1);
			return ymovie.util.DOM.span("info", [ymovie.util.DOM.span("name", "Trailer"), ymovie.util.DOM.span("domain", domain)]);
		}
		
		onClick(){
			this.update({...this.data, url:this.data.trailer});
		}
	}
}
