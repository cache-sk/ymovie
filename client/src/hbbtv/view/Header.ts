namespace ymovie.hbbtv.view {
	import Component = ymovie.view.Component;

	export class Header extends Component<HTMLDivElement> {
		readonly mediaComponent = new Item("Media");

		constructor() {
			super("div");
		}

		render() {
			this.clean();
			this.append([
				this.mediaComponent.render(),
				new Item("Search").render(),
				new Item("Setup").render(),
				new Item("About").render()
			]);

			return super.render();
		}
	}

	class Item extends FocusableComponent<HTMLDivElement> {
		private readonly label:string;

		constructor(label:string) {
			super("div");
			this.label = label;
		}

		render() {
			this.clean();
			this.append(this.label);
			return super.render();
		}
	}
}