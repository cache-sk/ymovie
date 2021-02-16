class DiscoveryHeader extends ymovie.view.base.Component {
	constructor(){
		super("div");
		
		this.searchForm = new SearchForm();
		
		const home = ymovie.util.DOM.span("home", "home");
		home.addEventListener("click", () => this.trigger(Action.HOME));
		
		const menuButton = ymovie.util.DOM.button("menuButton", "menu");
		menuButton.addEventListener("click", this.toggleMenu.bind(this));
		
		const setup = ymovie.util.DOM.button("setup", "setup");
		setup.addEventListener("click", this.onSetupClick.bind(this));
		
		const about = ymovie.util.DOM.button("about", "about");
		about.addEventListener("click", this.onAboutClick.bind(this));
		
		this.menu = ymovie.util.DOM.span("menu", [menuButton, ymovie.util.DOM.div("container", [setup, about])]);
		this.append([this.searchForm.render(), home, this.menu]);
	}
	
	set searchQuery(value){
		this.searchForm.searchQuery = value;
	}
	
	toggleMenu(){
		this.menu.classList.toggle("expanded");
	}
	
	onSetupClick(){
		this.toggleMenu();
		this.trigger(Action.SETUP);
	}
	
	onAboutClick(){
		this.toggleMenu();
		this.trigger(Action.ABOUT);
	}
}
