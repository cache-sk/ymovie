namespace ymovie.tv.util.Nav {
	export class Manager {
		static PATH_ABOUT = "/about";
		static PATH_PLAYER = "/player";
		static PATH_SEARCH = "/search";
		static PATH_SETUP = "/setup";

		readonly changed = new ymovie.util.Signal.Signal1<ChangeData>();

		constructor() {}

		init() {
			window.addEventListener("popstate", this.onWindowPopState.bind(this));
		}

		set title(value:string) {
			document.title = value ? `${value} | YMovie` : "YMovie";
		}

		get currentPath():string {
			return location.hash.substr(1);
		}

		goAbout() {
			this.pushState(undefined, "About", `#${Manager.PATH_ABOUT}`);
		}

		isAbout(path:string):boolean {
			return path.startsWith(Manager.PATH_ABOUT);
		}

		goHome() {
			this.pushState(undefined, "");
		}

		goPlayer() {
			this.pushState(undefined, "Player", `#${Manager.PATH_PLAYER}`);
		}

		isPlayer(path:string):boolean {
			return path.startsWith(Manager.PATH_PLAYER);
		}

		goSearch() {
			this.pushState(undefined, "Search", `#${Manager.PATH_SEARCH}`);
		}

		isSearch(path:string):boolean {
			return path.startsWith(Manager.PATH_SEARCH);
		}

		goSetup() {
			this.pushState(undefined, "Setup", `#${Manager.PATH_SETUP}`);
		}

		isSetup(path:string):boolean {
			return path.startsWith(Manager.PATH_SETUP);
		}

		goBack():void {
			history.back();
		}

		private pushState(source:StateSource, title:string, path?:string):void {
			const url = document.location.pathname + (path || "");
			const state = {source, title, url};
			history.pushState(state, title, url);
			this.title = title;
			this.triggerChange(state);
		}

		private triggerChange(state:State):void {
			const path = state.url.substr(document.location.pathname.length + 1);
			const data = {source:state.source, title:state.title, url:state.url, path};
			this.changed.dispatch(data);
		}

		protected onWindowPopState(event:PopStateEvent):void {
			const state = event.state;
			
			// ignore url entered by user
			if(!state)
				return;
			
			this.title = state?.title;
			this.triggerChange(state);
		}
	}

	export type State = {
		readonly source:StateSource;
		readonly title:string;
		readonly url:string;
	}

	export type StateSource = string | undefined;

	export type ChangeData = State & {
		readonly path:string;
	}
}
