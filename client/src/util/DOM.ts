namespace ymovie.util {
	export class DOM {
		static a(className?:string, content?:DOMContent, href?:string, target?:string):HTMLAnchorElement {
			const result = <HTMLAnchorElement>this.create("a", className, content);
			if(href)
				result.href = href;
			if(target)
				result.target = target;
			return result;
		}
		
		static button(className?:string, content?:DOMContent):HTMLButtonElement {
			return <HTMLButtonElement>this.create("button", className, content);
		}

		static div(className?:string, content?:DOMContent):HTMLDivElement {
			return <HTMLDivElement>this.create("div", className, content);
		}

		static form(className?:string, content?:DOMContent):HTMLFormElement {
			return <HTMLFormElement>this.create("form", className, content);
		}

		static h1(content?:DOMContent):HTMLHeadingElement {
			return <HTMLHeadingElement>this.create("h1", undefined, content);
		}
		
		static h2(content?:DOMContent):HTMLHeadingElement {
			return <HTMLHeadingElement>this.create("h2", undefined, content);
		}

		static img(className:string | undefined, src:string):HTMLImageElement {
			const result = <HTMLImageElement>this.create("img", className);
			result.src = src;
			return result;
		}
		
		static input(className:string | undefined, name:string, value?:string, placeholder?:string):HTMLInputElement {
			const result = <HTMLInputElement>this.create("input", className);
			result.name = name;
			result.type = "text";
			if(value)
				result.value = value;
			if(placeholder)
				result.placeholder = placeholder;
			return result;
		}
		
		static p(className?:string, content?:DOMContent){
			return this.create("p", className, content);
		}
		
		static password(className:string | undefined, name:string, value?:string, placeholder?:string):HTMLInputElement {
			const result = <HTMLInputElement>this.create("input", className);
			result.name = name;
			result.type = "password";
			if(value)
				result.value = value;
			if(placeholder)
				result.placeholder = placeholder;
			return result;
		}
		
		static span(className?:string, content?:DOMContent):HTMLSpanElement {
			return <HTMLSpanElement>this.create("span", className, content);
		}
		
		static submit(className?:string, value?:string):HTMLInputElement {
			const result = <HTMLInputElement>this.create("input", className);
			result.type = "submit";
			if(value)
				result.value = value;
			return result;
		}
		
		static text(value:string):Text {
			return document.createTextNode(value);
		}
		
		static textarea(className?:string, value?:string):HTMLTextAreaElement {
			const result = <HTMLTextAreaElement>this.create("textarea", className);
			if(value)
				result.value = value;
			return result;
		}
		
		static script(src:string):HTMLScriptElement {
			const result = <HTMLScriptElement>this.create("script");
			result.src = src;
			return result;
		}
		
		static create(type:string, className?:string, content?:DOMContent):HTMLElement {
			const result = document.createElement(type);
			this.append(result, content);
			if(className)
				result.className = className;
			return result;
		}
		
		static clean(container:Node){
			while(container.firstChild)
				container.removeChild(container.firstChild);
		}
		
		static append(container:HTMLElement, content?:DOMContent){
			if(content && Util.isString(content))
				container.appendChild(this.text(<string>content));
			else if(Util.isNumber(content))
				container.appendChild(this.text(content + ""));
			else if(content && Util.isArray(content))
				for(const item of <Array<DOMContent>>content)
					this.append(container, item);
			else if(content)
				container.appendChild(<Node>content);
		}
	}

	export type DOMContent = HTMLElement | string | Array<DOMContent>;
}
