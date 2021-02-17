namespace ymovie.view {
	export class NotificationView extends base.Dialogue<Data> {
		title:HTMLHeadingElement;
		message:HTMLParagraphElement;

		constructor(){
			super();
			this.title = util.DOM.h1();
			this.message = util.DOM.p();
			util.DOM.append(this.content, [this.title, this.message, this.closeButton]);
			this.append(this.content);
		}
		
		update(data?:Data) {
			this.show();
			return super.update(data);
		}
		
		render(){
			util.DOM.clean(this.title);
			util.DOM.clean(this.message);
			if(this.data?.title)
				util.DOM.append(this.title, this.data.title);
			if(this.data?.message)
				util.DOM.append(this.message, this.data.message);
			return super.render();
		}

		defaultRender(){
		}
	}

	type Data = {
		title:string;
		message:string;
	}
}
