/// <reference path="Component.ts"/>

namespace ymovie.view {
	import ApiScc = ymovie.api.ApiScc;
	import Catalogue = type.Catalogue;
	import Status = type.Status;

	export abstract class App extends Component<HTMLBodyElement> {
		readonly menu:Array<Catalogue.Base> = [
			new Catalogue.SccLink("movie", "Movies", ApiScc.PATH_MOVIES),
			new Catalogue.SccLink("series", "Series", ApiScc.PATH_SERIES),
			new Catalogue.SccLink("concert", "Concerts", ApiScc.PATH_CONCERTS),
			new Catalogue.SccLink("fairyTale", "Fairy Tales", ApiScc.PATH_FAIRY_TALES),
			new Catalogue.SccLink("animated", "Animated Movies", ApiScc.PATH_ANIMATED_MOVIES),
			new Catalogue.SccLink("animated", "Animated Series", ApiScc.PATH_ANIMATED_SERIES),
			new Catalogue.SccLink("movie", "Movies CZ/SK", ApiScc.PATH_MOVIES_CZSK),
			new Catalogue.SccLink("series", "Series CZ/SK", ApiScc.PATH_SERIES_CZSK),
			new Catalogue.SccLink("popular", "Popular Movies", ApiScc.PATH_POPULAR_MOVIES),
			new Catalogue.SccLink("popular", "Popular Series", ApiScc.PATH_POPULAR_SERIES),
			new Catalogue.SccLink("movie", "Added Movies", ApiScc.PATH_MOVIES_ADDED),
			new Catalogue.SccLink("series", "Added Series", ApiScc.PATH_SERIES_ADDED)];

		constructor(){
			super(document.body);
		}

		toggleClass(key:string, toggle:boolean){
			this.element.classList.toggle(key, toggle);
		}

		toggleApiClass(key:string, status:Status){
			this.toggleClass(`${key}-ok`, status === "ok");
			this.toggleClass(`${key}-na`, status === "na");
			this.toggleClass(`${key}-defined`, status === "defined");
		}

		onApiWebshareStatus(status:Status){
			this.toggleApiClass("webshare", status);
		}
	}
}