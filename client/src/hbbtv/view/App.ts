namespace ymovie.hbbtv.view {
	export class App extends ymovie.view.Component<HTMLBodyElement> {
		constructor(){
			super(document.body);
		}

		static async init(){
			const result = new App();
			await result.init();
		}

		async init():Promise<any> {
			console.log('hello');
			this.render();

			this.element.classList.toggle("initializing", false);
		}

		render() {
			this.append("hello");
			return super.render();
		}
	}
}
