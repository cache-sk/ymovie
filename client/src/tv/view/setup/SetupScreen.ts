namespace ymovie.tv.view.setup {
	import DOM = ymovie.util.DOM;

	export class SetupScreen extends Screen {
		render() {
			this.append(DOM.h1("Setup"));
			return super.render();
		}
	}
}
