namespace ymovie.view.base {
	export class Component {
		element:HTMLElement;

		constructor(element:ComponentElement) {
			this.element = util.Util.isString(element) ? util.DOM.create(<string>element) : <HTMLElement>element;
			// @ts-ignore
			this.element.classList.add(this.constructor.name);
			ymovie.util.Util.enhanceDispatcher(this, this.element);
		}
		
		append(content:util.DOMContent) {
			util.DOM.append(this.element, content);
		}
		
		clean() {
			util.DOM.clean(this.element);
		}
		
		render():HTMLElement {
			return this.element;
		}
	}

	type ComponentElement = HTMLElement | string;
}
