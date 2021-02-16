namespace ymovie.view.base {
	export class Dialogue<TData> extends ymovie.view.base.DataComponent<HTMLDivElement, TData> {
		scrollable:boolean;
		content:HTMLDivElement;
		closeButton:HTMLButtonElement;

		constructor(scrollable?:boolean){
			super("div");

			this.scrollable = scrollable || false;

			this.element.classList.add("Dialogue");
			this.element.classList.toggle("scrollable", !!scrollable);
			this.element.addEventListener("transitionend", this.onTransitionEnd.bind(this));
			
			this.content = util.DOM.div("content");
			this.closeButton = util.DOM.button("close", "close");
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
			util.DOM.clean(this.content);
			util.DOM.append(this.content, this.renderContent());
			this.append([this.content, this.closeButton]);
		}
		
		renderContent():util.DOMContent {
			return undefined;
		}
		
		onTransitionEnd(event:Event){
			this.element.classList.toggle("transition", false);
		}
		
		onCloseClick(event:Event){
			this.hide();
		}
	}
}
