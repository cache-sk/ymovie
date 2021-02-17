/// <reference path="Component.ts"/>

namespace ymovie.view.base {
	export class DataComponent<TElement extends HTMLElement, TData> extends Component<TElement> {
		data:TData | undefined;

		update(data?:TData):HTMLElement {
			this.data = data;
			return this.render();
		}
	}
}
