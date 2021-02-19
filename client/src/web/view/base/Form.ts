namespace ymovie.view.base {
	export class Form extends Component<HTMLFormElement> {
		constructor(){
			super("form");
			this.element.addEventListener("submit", this.onSubmit.bind(this));
		}
		
		set loading(value:boolean) {
			this.element.classList.toggle("loading", value);
		}
		
		async process() {}
		
		async onSubmit(event:Event) {
			event.preventDefault();
			this.loading = true;
			await this.process();
			this.loading = false;
		}
	}
}
