namespace ymovie.util {
	export class GA {
		constructor(){
		}
		
		init():void {
			// @ts-ignore
			window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
			this.ga('create', 'UA-183634-10', 'auto');
			this.ga('send', 'pageview');
		}
		
		pageview(page:string, title:string):void {
			this.ga('set', 'page', page);
			this.ga('set', 'title', title);
			this.ga('send', 'pageview');
		}

		private ga(a:string, b:string, c?:string) {
			// @ts-ignore
			window.ga(a, b, c);
		}
	}
}
