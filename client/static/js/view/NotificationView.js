class NotificationView extends Dialogue {
	constructor(){
		super();
		this.title = ymovie.util.DOM.h1();
		this.message = ymovie.util.DOM.p();
		ymovie.util.DOM.append(this.content, [this.title, this.message, this.closeButton]);
		this.append(this.content);
	}
	
	update(data){
		this.show();
		super.update(data);
	}
	
	render(){
		ymovie.util.DOM.clean(this.title);
		ymovie.util.DOM.clean(this.message);
		if(this.data?.title)
			ymovie.util.DOM.append(this.title, this.data.title);
		if(this.data?.message)
			ymovie.util.DOM.append(this.message, this.data.message);
		return super.render();
	}

	defaultRender(){
	}
}
