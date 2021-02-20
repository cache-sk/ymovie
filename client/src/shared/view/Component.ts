namespace ymovie.view {
	import DOM = util.DOM;
	import Action = type.Action;

	export class Component<TElement extends HTMLElement> {
		element:TElement;

		constructor(element:HTMLElement | string) {
			this.element = util.Util.isString(element) ? <TElement>DOM.create(<string>element) : <TElement>element;
			// @ts-ignore
			this.element.classList.add(this.constructor.name);
		}
		
		trigger(action:Action.Base) {
			this.element.dispatchEvent(new CustomEvent(action.type, {bubbles:true, detail:action.data}));
		}
		
		listen<T>(type:Action.Class<T>, listener:(event:CustomEvent<T>) => void) {
			this.element.addEventListener(Action.Base.getType(type), listener);
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
}
