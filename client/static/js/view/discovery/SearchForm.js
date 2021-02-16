class SearchForm extends ymovie.view.base.Form {
	constructor(){
		super();
		this.input = ymovie.util.DOM.input(null, "query", null, "search");
		this.input.addEventListener("keyup", this.onChange.bind(this));
	}
	
	render(){
		this.clean();
		this.append(this.input);
		return super.render();
	}
	
	set searchQuery(value){
		if(this.input.value !== value)
			this.input.value = value;
	}
	
	clearTimeout(){
		if(this.timeout)
			clearTimeout(this.timeout);
		this.timeout = null;
	}
	
	process(timeout){
		this.clearTimeout();
		if(!timeout)
			this.input.blur();
		const query = this.getField("query").value;
		this.trigger(ymovie.enums.Action.SEARCH, query ? {query} : null);
	}
	
	onChange(){
		this.clearTimeout();
		this.timeout = setTimeout(this.onTimeout.bind(this), 1000);
	}
	
	onTimeout(){
		this.clearTimeout();
		this.process(true);
	}
}
