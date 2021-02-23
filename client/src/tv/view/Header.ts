namespace ymovie.tv.view {
	import Action = type.Action;
	import Component = ymovie.view.Component;
	import Focus = util.Focus;
	import ScreenId = type.ScreenId;

	export class Header extends Component<HTMLDivElement> {
		constructor() {
			super("div");
		}

		render() {
			this.clean();
			this.append([
				new Item("media", "Media").render(),
				new Item("search", "Search").render(),
				new Item("setup", "Setup").render(),
				new Item("about", "About").render()
			]);

			return super.render();
		}
	}

	class Item extends FocusableComponent<HTMLDivElement> {
		private readonly id:ScreenId;
		private readonly label:string;

		constructor(id:ScreenId, label:string) {
			super("div");
			this.id = id;
			this.label = label;
			this.element.classList.add(id);
		}

		render() {
			this.clean();
			this.append(this.label);
			return super.render();
		}

		executeFocusEvent(event:Focus.Event):boolean {
			if(event.action == "submit") {
				this.trigger(new Action.ShowScreen(this.id));
				return true;
			}
			return false;
		}
	}
}