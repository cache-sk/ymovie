class Dialogue extends Component {
	constructor(scrollable){
		super("div");

		this.scrollable = scrollable;

		this.element.classList.add("Dialogue");
		this.element.classList.toggle("scrollable", !!scrollable);
		this.element.addEventListener("transitionend", this.onTransitionEnd.bind(this));
		
		this.content = DOM.div("content");
		this.closeButton = DOM.button("close", "close");
		this.closeButton.addEventListener("click", this.onCloseClick.bind(this));
	}
	
	get isVisible(){
		return this.element.classList.contains("visible");
	}
	
	show(){
		this.element.classList.toggle("visible", true);
		this.element.classList.toggle("transition", true);
		if(this.scrollable)
			this.content.style.transform = `translateY(${window.scrollY}px)`;
	}
	
	hide(){
		this.element.classList.toggle("visible", false);
		this.element.classList.toggle("transition", true);
	}

	render(){
		this.defaultRender();
		return super.render();
	}
	
	defaultRender(){
		this.clean();
		DOM.clean(this.content);
		DOM.append(this.content, this.renderContent());
		this.append([this.content, this.closeButton]);
	}
	
	renderContent(){
	}
	
	onTransitionEnd(event){
		this.element.classList.toggle("transition", false);
	}
	
	onCloseClick(event){
		this.hide();
	}
}
