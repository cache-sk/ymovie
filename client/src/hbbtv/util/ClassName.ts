namespace ymovie.hbbtv.util {
	export class ClassName {
		static updateType(element:HTMLElement, type:String, value:String){
			var prefix = type + "-";
			for(let i = element.classList.length - 1; i >= 0; i--) {
				const item = element.classList[i]!;
				if(item.startsWith(prefix))
					element.classList.remove(item);
			}
			if(value != null)
				element.classList.add(prefix + value);

		}
	}
}
