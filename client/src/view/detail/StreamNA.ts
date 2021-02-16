namespace ymovie.view.detail {
	export class StreamNA extends StreamOption {
		static create(){
			return new this(null);
		}
		
		get url(){
			return null;
		}
		
		renderInfo(){
			return util.DOM.span("info", util.DOM.span("name", "No streams available."));
		}
		
		onClick(){
		}
	}
}
