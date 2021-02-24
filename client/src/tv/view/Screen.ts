namespace ymovie.tv.view {
	import Component = ymovie.view.Component;
	import Context = ymovie.tv.type.Context;

	export abstract class Screen extends Component<HTMLDivElement> {
		protected readonly context:Context;

		constructor(context:Context) {
			super("div");
			this.context = context;
			this.element.classList.add("Screen");
		}

		activate(_requestFocus:boolean) {}
	}
}