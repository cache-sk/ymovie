namespace ymovie.view.base {
	export class Component<TElement extends HTMLElement> {
		element:TElement;

		dispatcher:EventTarget | undefined;
		trigger:((type:any, detail?:any) => void) | undefined;
		listen:((type:any, callback:(detail:any, event?:CustomEvent) => void) => void) | undefined;

		constructor(element:ComponentElement) {
			this.element = util.Util.isString(element) ? <TElement>util.DOM.create(<string>element) : <TElement>element;
			// @ts-ignore
			this.element.classList.add(this.constructor.name);
			util.Util.enhanceDispatcher(this, this.element);
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
