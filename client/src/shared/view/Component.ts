namespace ymovie.view {
	import DOM = ymovie.util.DOM;

	export class Component<TElement extends HTMLElement> {
		element:TElement;

		trigger:util.Trigger.Triggerer;
		listen:util.Trigger.Listener;

		constructor(element:ComponentElement) {
			this.element = util.Util.isString(element) ? <TElement>DOM.create(<string>element) : <TElement>element;
			// @ts-ignore
			this.element.classList.add(this.constructor.name);
			util.Trigger.enhance(this, this.element);
		}
		
		append(content:DOM.Content) {
			DOM.append(this.element, content);
		}
		
		clean() {
			DOM.clean(this.element);
		}
		
		render():HTMLElement {
			return this.element;
		}
	}

	type ComponentElement = HTMLElement | string;
}
