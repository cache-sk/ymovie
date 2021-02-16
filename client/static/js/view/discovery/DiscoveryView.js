class DiscoveryView extends ymovie.view.base.DataComponent {
	constructor(){
		super("div");
		
		this.catalogue = new Catalogue();
		this.catalogue.element.addEventListener("touchstart", this.onCatalogueTouchStart.bind(this));
		this.header = new DiscoveryHeader();
		this.append([this.catalogue.render(), this.header.render()]);
	}
	
	set searchQuery(value){
		this.header.searchQuery = value;
	}
	
	render(){
		[...this.element.classList].forEach(value => this.validateClassName(value));
		if(this.data.type)
			this.element.classList.toggle(`type-${this.data.type}`, true);
		return super.render();
	}
	
	validateClassName(value){
		if(value.startsWith("type-") && value != `type-${this.data.type}`)
			this.element.classList.toggle(value, false);
	}
	
	update(data){
		this.catalogue.update(data.catalogue);
		return super.update(data);
	}
	
	// unfocus search input on mobile
	onCatalogueTouchStart(){
		if(document.activeElement.tagName === "INPUT")
			document.activeElement.blur();
	}
}
