namespace ymovie.hbbtv.view {
	export class FocusableDataComponent<TElement extends HTMLElement, TData> extends FocusableComponent<TElement> {
		data:TData;

		constructor(element:HTMLElement | string, data:TData) {
			super(element);
			this.data = data;
		}

		update(data:TData):HTMLElement {
			this.data = data;
			return this.render();
		}
	}
}
