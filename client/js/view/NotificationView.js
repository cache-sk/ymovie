class NotificationView extends Dialogue {
	constructor(){
		super();
		this.title = DOM.h1();
		this.message = DOM.p();
		DOM.append(this.content, [this.title, this.message, this.closeButton]);
		this.append(this.content);
	}
	
	update(data){
		this.show();
		super.update(data);
	}
	
	render(){
		DOM.clean(this.title);
		DOM.clean(this.message);
		if(this.data?.title)
			DOM.append(this.title, this.data.title);
		if(this.data?.message)
			DOM.append(this.message, this.data.message);
		return super.render();
	}

	defaultRender(){
	}
}