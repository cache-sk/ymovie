class Form extends Component{
	constructor(){
		super("form");
		this.element.addEventListener("submit", this.onSubmit.bind(this));
	}
	
	set loading(value){
		this.element.classList.toggle("loading", value);
	}
	
	getField(name){
		return this.element.elements[name];
	}
	
	async process(){
	}
	
	async onSubmit(event){
		event.preventDefault();
		this.loading = true;
		await this.process();
		this.loading = false;
	}
}
