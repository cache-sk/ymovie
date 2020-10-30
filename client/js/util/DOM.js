class DOM {
	static a(className, content, href, target){
		const result = this.create("a", className, content);
		if(href)
			result.href = href;
		if(target)
			result.target = target;
		return result;
	}
	
	static button(className, content){
		return this.create("button", className, content);
	}

	static div(className, content){
		return this.create("div", className, content);
	}

	static form(className, content){
		return this.create("form", className, content);
	}

	static h1(content){
		return this.create("h1", null, content);
	}
	
	static h2(content){
		return this.create("h2", null, content);
	}

	static img(className, src){
		const result = this.create("img", className);
		result.src = src;
		return result;
	}
	
	static input(className, name, value, placeholder){
		const result = this.create("input", className);
		result.name = name;
		result.type = "text";
		if(value)
			result.value = value;
		if(placeholder)
			result.placeholder = placeholder;
		return result;
	}
	
	static p(className, content){
		return this.create("p", className, content);
	}
	
	static password(className, name, value, placeholder){
		const result = this.create("input", className);
		result.name = name;
		result.type = "password";
		if(value)
			result.value = value;
		if(placeholder)
			result.placeholder = placeholder;
		return result;
	}
	
	static span(className, content){
		return this.create("span", className, content);
	}
	
	static submit(className, value){
		const result = this.create("input", className);
		result.type = "submit";
		if(value)
			result.value = value;
		return result;
	}
	
	static text(value){
		return document.createTextNode(value);
	}
	
	static textarea(className, value){
		const result = this.create("textarea", className);
		result.value = value;
		return result;
	}
	
	static script(src){
		const result = this.create("script");
		result.src = src;
		return result;
	}
	
	static create(type, className, content){
		const result = document.createElement(type);
		this.append(result, content);
		if(className)
			result.className = className;
		return result;
	}
	
	static clean(container){
		while(container.firstChild)
			container.removeChild(container.firstChild);
	}
	
	static append(container, content){
		if(content && Util.isString(content))
			container.appendChild(this.text(content));
		else if(Util.isNumber(content))
			container.appendChild(this.text(content + ""));
		else if(content && Util.isArray(content))
			for(const item of content)
				this.append(container, item);
		else if(content)
			container.appendChild(content);
	}
}
