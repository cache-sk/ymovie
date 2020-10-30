/**
 * Kodi is only available on ws: protocol which is incompatible with cast api which is 
 * only available on secured origin. Either the app is loaded over http or https so either 
 * kodi or cast works.
 * Decided to use https and this ApiKodi implementation provides connector and messaging between 
 * parent (https) and child (http) window with kodi api and communication (see kodi.html).
 */
class ApiKodi {
	constructor(){
	}
	
	getConnectorUrl(){
		const location = document.location;
		const protocol = location.protocol === "https:" ? "http:" : location.protocol;
		const pathname = location.pathname.split("/").slice(0, -1).join("/") + "/kodi.html";
		return `${protocol}//${location.host}${pathname}`;
	}
	
	isAvailable(endpoint){
		const payload = {command:"isAvailable", params:[endpoint]};
		return this.request(payload);
	}
	
	play(endpoint, file){
		const payload = {command:"play", params:[endpoint, file]};
		return this.request(payload);
	}
	
	request(payload){
		return new Promise((resolve, reject) => {
			const w = window.open(`${this.getConnectorUrl()}#${encodeURIComponent(JSON.stringify(payload))}`);
			const listener = event => {
				window.removeEventListener("message", listener, false);
				w.close();
				clearTimeout(timer);
				if(!event)
					return reject("Process timed out.");
				try{
					if(event.data.result === "OK")
						return resolve(event.data);
					if(event.data.error)
						return reject(event.data.error.message);
				}catch(error){}
				reject("Unknown error.");
			}
			const timer = setTimeout(listener, 4000);
			window.addEventListener("message", listener, false);
		})
	}
}
