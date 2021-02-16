namespace ymovie.view.setup {
	export class KodiSetupForm extends base.Form<any> {
		api:api.Api;
		position:number;

		constructor(api:api.Api, position:number){
			super();
			this.api = api;
			this.api.listen?.(this.api.getKodiStatusKey(position), this.render.bind(this));
			this.position = position;
			this.element.classList.add(`position${position}`);
		}

		static create(api:api.Api, position:number){
			return new this(api, position);
		}
		
		render(){
			this.clean();
			
			const endpoint = this.api.getKodiEndpoint(this.position);
			this.append([
				util.DOM.input(undefined, "endpoint", endpoint || undefined, `Endpoint #${this.position}`),
				util.DOM.submit(undefined, "Submit")]);
			if(this.data && this.data.error)
				this.append(util.DOM.span("error", this.data.error));
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
}
