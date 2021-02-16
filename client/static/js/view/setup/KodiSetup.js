class KodiSetup extends ymovie.view.base.Component {
	static DEFAULT_URL = "ws://127.0.0.1:9090/jsonrpc?kodi";
	
	constructor(api){
		super("div");
		this.api = api;
		this.instructions = ymovie.util.DOM.p();
		this.instructions.innerHTML = `On your Kodi box, enable <a href="https://kodi.wiki/view/Settings/Services/Control" target="_blank">control settings</a>, including <q>other systems</q> option. Once enabled, provide an endpoint in the following format <strong>${this.constructor.DEFAULT_URL}</strong> using your Kodi box IP address. This device needs direct visiblity to the used IP (i.e. same network). You can setup 2 different Kodi endpoints.`;
	}
	
	render(){
		this.clean();
		
		const endpoint = this.api.kodiEndpoint;
		this.append([ymovie.util.DOM.h1("Kodi"),
			KodiSetupForm.create(this.api, 1).render(),
			KodiSetupForm.create(this.api, 2).render()]);
		this.append(this.instructions);
		return super.render();
	}
}
