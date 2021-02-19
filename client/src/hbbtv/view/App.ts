namespace ymovie.view {
	export class App extends base.Component<HTMLBodyElement> {
		constructor(){
			super(document.body);
		}

		static async init(){
			const result = new App();
			await result.init();
		}

		async init():Promise<any> {

		}
	}
}
