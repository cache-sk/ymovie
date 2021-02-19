namespace ymovie.web.view.setup {
	import Component = ymovie.view.Component
	import DOM = ymovie.util.DOM;

	export class KodiSetup extends Component<HTMLDivElement> {
		static DEFAULT_URL = "ws://127.0.0.1:9090/jsonrpc?kodi";
		
		api:api.Api;
		instructions:HTMLParagraphElement;

		constructor(api:api.Api){
			super("div");
			this.api = api;
			this.instructions = DOM.p();
			this.instructions.innerHTML = `On your Kodi box, enable <a href="https://kodi.wiki/view/Settings/Services/Control" target="_blank">control settings</a>, including <q>other systems</q> option. Once enabled, provide an endpoint in the following format <strong>${KodiSetup.DEFAULT_URL}</strong> using your Kodi box IP address. This device needs direct visiblity to the used IP (i.e. same network). You can setup 2 different Kodi endpoints.`;
		}
		
		render(){
			this.clean();
			
			this.append([DOM.h1("Kodi"),
				new KodiSetupForm(this.api, 1).render(),
				new KodiSetupForm(this.api, 2).render()]);
			this.append(this.instructions);
			return super.render();
		}
	}
}
