namespace ymovie.view.base {
	export class Form<TData> extends ymovie.view.base.DataComponent<HTMLFormElement, TData> {
		constructor(){
			super("form");
			this.element.addEventListener("submit", this.onSubmit.bind(this));
		}
		
		set loading(value:boolean) {
			this.element.classList.toggle("loading", value);
		}
		
		getField(name:string):HTMLInputElement {
			// @ts-ignore
			return this.element.elements[name];
		}
		
		async process(){
		}
		
		async onSubmit(event:Event){
			event.preventDefault();
			this.loading = true;
			await this.process();
			this.loading = false;
		}
	}
}
