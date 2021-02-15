class SetupView extends Dialogue {
	constructor(api){
		super();
		this.webshareSetup = new WebshareSetup(api);
		this.kodiSetup = new KodiSetup(api);
	}
	
	renderContent(){
		return [this.webshareSetup.render(), this.kodiSetup.render()];
	}
	
	onCloseClick(event){
		this.trigger(Action.BACK);
	}
}
