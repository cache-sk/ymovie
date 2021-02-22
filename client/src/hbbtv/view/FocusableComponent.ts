namespace ymovie.hbbtv.view {
	import Component = ymovie.view.Component;
	import Focus = util.Focus;

	export class FocusableComponent<TElement extends HTMLElement> 
		extends Component<TElement> implements Focus.IFocusable {
		
		constructor(element:HTMLElement | string) {
			super(element);

			this.listenOn(document.body, type.Action.RegisterFocusable, this.onRegister.bind(this));
		}

		focus():void {
			this.element.classList.add("focused");
		}

		blur():void {
			this.element.classList.remove("focused");
		}

		getBoundingRect():Focus.Rect {
			const rect = this.element.getBoundingClientRect();
			return new Focus.Rect(rect.left, rect.top, rect.width, rect.height);
		}

		getFocusLayer():string {
			return "main";
		}

		executeFocusEvent():boolean {
			return false;
		}

		modifyFocusEvent(event:Focus.Event):Focus.Event {
			return event;
		}

		allowHorizontalCirculation():boolean {
			return false;
		}

		onRegister(event:CustomEvent<Array<Focus.IFocusable>>) {
			event.detail.push(this);
		}
	}
}