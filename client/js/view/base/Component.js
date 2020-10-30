class Component {
	constructor(element){
		this.element = Util.isString(element) ? DOM.create(element) : element;
		this.element.classList.add(this.constructor.name);
		Util.enhanceDispatcher(this, this.element);
	}
	
	append(content){
		DOM.append(this.element, content);
	}
	
	clean(){
		DOM.clean(this.element);
	}
	
	render(){
		return this.element;
	}
	
	update(data){
		this.data = data;
		return this.render();
	}
}
