/// <reference path="DataComponent.ts"/>

namespace ymovie.view.base {
	export class Dialogue<TData> extends DataComponent<HTMLDivElement, TData> {
		protected readonly content:HTMLDivElement;
		protected readonly closeButton:HTMLButtonElement;
		protected translateX = 0;
		protected translateY = 0;

		private scrollable:boolean;
		private _onDocumentKeyDown = this.onDocumentKeyDown.bind(this);

		constructor(scrollable:boolean=false) {
			super("div");

			this.scrollable = scrollable;

			this.element.classList.add("Dialogue");
			this.element.classList.toggle("scrollable", scrollable);
			this.element.addEventListener("transitionend", this.onTransitionEnd.bind(this));
			
			this.content = util.DOM.div("content");
			this.closeButton = util.DOM.button("close", "close");
			this.closeButton.addEventListener("click", this.onCloseClick.bind(this));
		}
		
		get isVisible() {
			return this.element.classList.contains("visible");
		}
		
		show() {
			this.element.classList.toggle("visible", true);
			this.element.classList.toggle("transition", true);
			if(this.scrollable) {
				this.translateY = window.scrollY;
				this.transformContent();
			}
			document.addEventListener("keydown", this._onDocumentKeyDown);
		}
		
		hide() {
			this.element.classList.toggle("visible", false);
			this.element.classList.toggle("transition", true);
			document.removeEventListener("keydown", this._onDocumentKeyDown);
		}

		transformContent() {
			this.content.style.transform = `translate(${this.translateX}px, ${this.translateY}px)`;
		}

		render() {
			this.defaultRender();
			return super.render();
		}
		
		defaultRender() {
			this.clean();
			util.DOM.clean(this.content);
			util.DOM.append(this.content, this.renderContent());
			this.append([this.content, this.closeButton]);
		}
		
		renderContent():util.DOMContent {
			return undefined;
		}

		close() {
			this.hide();
		}
		
		onTransitionEnd() {
			this.element.classList.toggle("transition", false);
		}
		
		onCloseClick() {
			this.close();
		}

		onDocumentKeyDown(event:KeyboardEvent) {
			if(event.key == "Escape")
				return this.close();
		}
	}
}
