namespace ymovie.view.detail {
	export class StreamNA extends StreamOption<any> {
		static create(){
			return new this(null);
		}
		
		get url(){
			return undefined;
		}
		
		renderInfo(){
			return util.DOM.span("info", util.DOM.span("name", "No streams available."));
		}
		
		onClick(){
		}
	}
}
