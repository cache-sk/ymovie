namespace ymovie.util.Url {
	export function setParam(url:string, name:string, value:string):string {
		const keyVal = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
		const urlChunks = url.split("?");
		if(urlChunks.length < 2)
			return `${url}?${keyVal}`; 
		
		let match = false;
		let newUrl = `${urlChunks[0]}?`;
		const queryChunks = urlChunks[1]?.split("&")!;
		for (const queryChunk of queryChunks) {
			if(decodeURIComponent(queryChunk.split("=")[0]!) === name) {
				match = true;
				newUrl += `&${keyVal}`;	
			} else {
				newUrl += `&${queryChunk}`;
			}
		}
		if(!match)
			newUrl += `&${keyVal}`;
		return newUrl.replace("?&", "?");
	}
}
