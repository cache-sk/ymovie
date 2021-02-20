namespace ymovie.web.view.setup {
	export class SetupView extends base.Dialogue<any> {
		webshareSetup:WebshareSetup;
		kodiSetup:KodiSetup;

		constructor(api:api.Api){
			super();
			this.webshareSetup = new WebshareSetup(api);
			this.kodiSetup = new KodiSetup(api);
		}
		
		renderContent(){
			return [this.webshareSetup.render(), this.kodiSetup.render()];
		}
		
		close() {
			this.trigger(new type.Action.GoBack());
		}
	}
}
