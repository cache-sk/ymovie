class WebshareSetup extends Form {
	constructor(api){
		super();
		this.api = api;
		this.api.listen(Action.WEBSHARE_STATUS_UPDATED, this.render.bind(this));
		
		this.clear = DOM.button("clear", "Clear token");
		this.clear.addEventListener("click", this.onClearClick.bind(this));
		
		this.instructions = DOM.p();
		this.instructions.innerHTML = `Provide your Webshare credentials to resolve available streams. Only access token is stored in a cookie.`;
	}
	
	render(){
		this.clean();
		this.append(DOM.h1("Webshare"));
		
		const data = this.data;
		const token = this.api.webshareToken;
		if(token){
			const tokenInput = DOM.input("token", "token", token);
			tokenInput.setAttribute("readonly", "");
			this.append([tokenInput, this.clear]);
		}else{
			this.append([DOM.input(null, "username", data?.username, "username"),
				DOM.password(null, "password", data?.password, "password")]);
		}
		
		this.append(DOM.submit(null, "Submit"));
		if(this.data && this.data.error)
			this.append(DOM.span("error", this.data.error));
		this.append(this.instructions);
		return super.render();
	}
	
	async process(){
		if(this.getField("token"))
			return this.update(await this.api.checkWebshareStatus() ? null : {error:"Invalid token."});
		
		const username = this.getField("username").value;
		const password = this.getField("password").value;
		const result = await this.api.loginWebshare(username, password);
		return this.update(result ? null : {error:"Invalid username or password.", username, password});
	}
	
	onClearClick(event){
		event.preventDefault();
		this.api.logoutWebshare();
		this.update();
	}
}
