namespace ymovie.tv.util.DOMUtil {
	export function getGlobalRect(element:Element):Rect {
		return element.getBoundingClientRect();
	}

	/** Chrome 33 only contains following properties: */
	type Rect = {
		readonly top:number;
		readonly right:number;
		readonly bottom:number;
		readonly left:number;
		readonly width:number;
		readonly height:number;
	}
}
