namespace ymovie.tv.view {
	import Action = ymovie.tv.type.Action;
	import Component = ymovie.view.Component;
	import Focus = util.Focus;
	import FocusableComponent = ymovie.tv.view.FocusableComponent;
	import OSKAction = ymovie.tv.type.OSKAction;

	export class OSK extends Component<HTMLDivElement> {
		constructor() {
			super("div");

			const keys = [
				"0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
				"a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
				"k", "l", "m", "n", "o", "p", "q", "r", "s", "t", 
				"u", "v", "w", "x", "y", "z", "SPACE", "DEL"]
			this.append(keys.map(key => new Key(key).render()));
		}
	}

	class Key extends FocusableComponent<HTMLButtonElement> {
		readonly action:string;

		constructor(action:string) {
			super("button");

			this.action = action;
			this.element.textContent = action;
			this.element.classList.add(`action-${action}`);
			this.element.addEventListener("click", this.onClick.bind(this));
		}

		executeFocusEvent(event:Focus.Event):boolean {
			if(event.action === "submit") {
				this.submit();
				return true;
			}
			return false;
		}

		private submit() {
			let type:OSKAction = "insert";
			if(this.action === "SPACE")
				type = "space";
			if(this.action === "DEL")
				type = "del";
			this.trigger(new Action.OSKKey({value:this.action, type}));
		}

		private onClick() {
			this.submit();
		}
	}
}
