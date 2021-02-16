namespace ymovie.view.setup {
	export class WebshareSetup extends base.Form<any> {
		api:api.Api;
		clear:HTMLButtonElement;
		instructions:HTMLParagraphElement;

		constructor(api:api.Api){
			super();
			this.api = api;
			this.api.listen?.(enums.Action.WEBSHARE_STATUS_UPDATED, this.render.bind(this));
			
			this.clear = util.DOM.button("clear", "Clear token");
			this.clear.addEventListener("click", this.onClearClick.bind(this));
			
			this.instructions = util.DOM.p();
			this.instructions.innerHTML = `Provide your Webshare credentials to resolve available streams. Only access token is stored in a cookie.`;
		}
		
		render(){
			this.clean();
			this.append(ymovie.util.DOM.h1("Webshare"));
			
			const data = this.data;
			const token = this.api.webshareToken;
			if(token){
				const tokenInput = ymovie.util.DOM.input("token", "token", token);
				tokenInput.setAttribute("readonly", "");
				this.append([tokenInput, this.clear]);
			}else{
				this.append([ymovie.util.DOM.input(undefined, "username", data?.username, "username"),
					ymovie.util.DOM.password(undefined, "password", data?.password, "password")]);
			}
			
			this.append(ymovie.util.DOM.submit(undefined, "Submit"));
			if(this.data && this.data.error)
				this.append(ymovie.util.DOM.span("error", this.data.error));
			this.append(this.instructions);
			return super.render();
		}
		
		async process():Promise<any> {
			if(this.getField("token"))
				return this.update(await this.api.checkWebshareStatus() ? null : {error:"Invalid token."});
			
			const username = this.getField("username").value;
			const password = this.getField("password").value;
			const result = await this.api.loginWebshare(username, password);
			return this.update(result ? null : {error:"Invalid username or password.", username, password});
		}
		
		onClearClick(event:Event){
			event.preventDefault();
			this.api.logoutWebshare();
			this.update();
		}
	}
}
