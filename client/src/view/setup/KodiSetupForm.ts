namespace ymovie.view.setup {
	export class KodiSetupForm extends base.Form {
		api:api.Api;
		position:type.Player.KodiPosition;
		data:Data | undefined;
		endpointInput:HTMLInputElement;

		constructor(api:api.Api, position:type.Player.KodiPosition){
			super();
			this.api = api;
			this.api.listen?.(type.Action.KodiStatusUpdated, this.render.bind(this));
			this.position = position;
			this.element.classList.add(`position${position}`);
			const endpoint = this.api.getKodiEndpoint(this.position);
			this.endpointInput = util.DOM.input(undefined, "endpoint", endpoint || undefined, `Endpoint #${this.position}`)
		}

		update(data?:Data):HTMLElement {
			this.data = data;
			return this.render();
		}
		
		render(){
			this.clean();
			this.append([
				this.endpointInput,
				util.DOM.submit(undefined, "Submit")]);
			if(this.data && this.data.error)
				this.append(util.DOM.span("error", this.data.error));
			return super.render();
		}
		
		async process(){
			const endpoint = this.endpointInput.value;
			try {
				await this.api.connectKodi(this.position, endpoint);
				this.update();
			} catch(error) {
				this.update({error});
			}
		}
	}

	type Data = {
		error?:string;
	}
}
