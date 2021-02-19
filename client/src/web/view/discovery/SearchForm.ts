namespace ymovie.web.view.discovery {
	export class SearchForm extends base.Form {
		input:HTMLInputElement;
		timeout:number | undefined;

		constructor(){
			super();
			this.input = util.DOM.input(undefined, "query", undefined, "search");
			this.input.addEventListener("keyup", this.onChange.bind(this));
		}
		
		render(){
			this.clean();
			this.append(this.input);
			return super.render();
		}
		
		set searchQuery(value:string) {
			if(this.input.value !== value)
				this.input.value = value;
		}
		
		clearTimeout(){
			if(this.timeout)
				clearTimeout(this.timeout);
			this.timeout = undefined;
		}
		
		async process() {
			this.clearTimeout();
			const query = this.input.value;
			this.trigger?.(new ymovie.type.Action.Search({query}));
		}
		
		onChange(){
			this.clearTimeout();
			this.timeout = setTimeout(this.onTimeout.bind(this), 1000);
		}
		
		async onSubmit(event:Event) {
			await super.onSubmit(event);
			this.input.blur();
		}

		onTimeout(){
			this.clearTimeout();
			this.process();
		}
	}
}
