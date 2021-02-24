namespace ymovie.tv.view {
	import Action = type.Action;
	import Component = ymovie.view.Component;
	import ScreenId = type.ScreenId;

	export class Header extends Component<HTMLDivElement> {
		readonly media = new Item("media", "Media");
		readonly search = new Item("search", "Search");
		readonly setup = new Item("setup", "Setup");
		readonly about = new Item("about", "About");

		constructor() {
			super("div");
		}

		render() {
			this.clean();
			this.append([
				this.media.render(),
				this.search.render(),
				this.setup.render(),
				this.about.render()]);
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

		focus() {
			super.focus();
			this.trigger(new Action.ShowScreen(this.id));
		}
	}
}
