namespace ymovie.hbbtv.view {
	import Action = type.Action;
	import Focus = util.Focus;

	export class App extends ymovie.view.App {
		api = new api.Api();
		focus = new Focus.Manager();
		header = new Header();
		menuView = new Menu(this.menu);

		static async init(){
			const result = new App();
			await result.init();
		}

		async init():Promise<any> {
			this.api.webshareStatusChanged.add(this.onApiWebshareStatus.bind(this));
			await this.api.init();

			this.render();
			this.element.classList.toggle("initializing", false);

			this.focus.focusedComponent = this.header.mediaComponent;

			document.addEventListener("keydown", this.onDocumentKeyDown.bind(this));
		}

		render(){
			this.append([this.header.render(), 
				this.menuView.render()]);
			return super.render();
		}

		onDocumentKeyDown(event:KeyboardEvent) {
			let action:Focus.Action | undefined;
			if(event.key == "ArrowLeft")
				action = "left";
			else if(event.key == "ArrowRight")
				action = "right";
			else if(event.key == "ArrowUp")
				action = "up";
			else if(event.key == "ArrowDown")
				action = "down";
			if(!action)
				return;

			const register = new Action.RegisterFocusable();
			this.trigger(register);
			this.focus.components = register.data;
			this.focus.executeEvent({action});
		}
	}
}
