namespace ymovie.tv.view.search {
	import DOM = ymovie.util.DOM;

	export class SearchScreen extends Screen {
		render() {
			this.append(DOM.h1("Search"));
			return super.render();
		}
	}
}
