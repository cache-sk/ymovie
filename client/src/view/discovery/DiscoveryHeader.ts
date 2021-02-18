namespace ymovie.view.discovery {
	export class DiscoveryHeader extends base.Component<HTMLDivElement> {
		searchForm:SearchForm;
		menu:HTMLSpanElement;

		constructor(){
			super("div");
			
			this.searchForm = new SearchForm();
			
			const home = util.DOM.span("home", "home");
			home.addEventListener("click", () => this.trigger?.(new type.Action.GoHome(false)));
			
			const menuButton = util.DOM.button("menuButton", "menu");
			menuButton.addEventListener("click", this.toggleMenu.bind(this));
			
			const setup = util.DOM.button("setup", "setup");
			setup.addEventListener("click", this.onSetupClick.bind(this));
			
			const about = util.DOM.button("about", "about");
			about.addEventListener("click", this.onAboutClick.bind(this));
			
			this.menu = util.DOM.span("menu", [menuButton, util.DOM.div("container", [setup, about])]);
			this.append([this.searchForm.render(), home, this.menu]);
		}
		
		set searchQuery(value:string){
			this.searchForm.searchQuery = value;
		}
		
		toggleMenu(){
			this.menu.classList.toggle("expanded");
		}
		
		onSetupClick(){
			this.toggleMenu();
			this.trigger?.(new type.Action.ShowSetup(false));
		}
		
		onAboutClick(){
			this.toggleMenu();
			this.trigger?.(new type.Action.ShowSetup(false));
		}
	}
}
