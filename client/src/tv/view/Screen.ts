namespace ymovie.tv.view {
	import Component = ymovie.view.Component;
	import Context = ymovie.tv.type.Context;
	import Focus = ymovie.tv.util.Focus;

	export abstract class Screen extends Component<HTMLDivElement> {
		protected readonly context:Context;
		private active:boolean = false;

		constructor(context:Context) {
			super("div");
			this.context = context;
			this.element.classList.add("Screen");
		}

		get isActive() {
			return this.active;
		}

		activate(_currentFocus:Focus.IFocusable | undefined) {
			this.active = true;
		}

		deactivate() {
			this.active = false;
		}
	}
}