namespace ymovie.tv.view {
	import Component = ymovie.view.Component;

	export abstract class Screen extends Component<HTMLDivElement> {
		constructor() {
			super("div");
			this.element.classList.add("Screen");
		}
	}
}