class KodiSetupForm extends Form {
	static create(api, position){
		return new this(api, position);
	}

	constructor(api, position){
		super();
		this.api = api;
		this.api.listen(this.api.getKodiStatusKey(position), this.render.bind(this));
		this.position = position;
		this.element.classList.add(`position${position}`);
	}
	
	render(){
		this.clean();
		
		const endpoint = this.api.getKodiEndpoint(this.position);
		this.append([
			DOM.input(null, "endpoint", endpoint, `Endpoint #${this.position}`),
			DOM.submit(null, "Submit")]);
		if(this.data && this.data.error)
			this.append(DOM.span("error", this.data.error));
		return super.render();
	}
	
	async process(){
		const endpoint = this.getField("endpoint").value;
		try {
			await this.api.connectKodi(this.position, endpoint);
			this.update();
		} catch(error) {
			this.update({error});
		}
	}
}
