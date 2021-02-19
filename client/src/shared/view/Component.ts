namespace ymovie.view {
	export class Component<TElement extends HTMLElement> {
		element:TElement;

		trigger:util.Trigger.Triggerer;
		listen:util.Trigger.Listener;

		constructor(element:ComponentElement) {
			this.element = util.Util.isString(element) ? <TElement>util.DOM.create(<string>element) : <TElement>element;
			// @ts-ignore
			this.element.classList.add(this.constructor.name);
			util.Trigger.enhance(this, this.element);
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
