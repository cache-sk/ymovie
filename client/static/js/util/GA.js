class GA {
	constructor(){
	}
	
	init(){
		window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
		ga('create', 'UA-183634-10', 'auto');
		ga('send', 'pageview');
	}
	
	pageview(page, title){
		ga('set', 'page', page);
		ga('set', 'title', title);
		ga('send', 'pageview');
	}
}
