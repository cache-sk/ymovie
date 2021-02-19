/// <reference path="StreamOption.ts"/>

namespace ymovie.web.view.detail {
	export class StreamNA extends StreamOption<any> {
		get url(){
			return undefined;
		}
		
		renderInfo(){
			return util.DOM.span("info", util.DOM.span("name", "No streams available."));
		}
		
		onClick(){}
	}
}
