class Util {
	static isArray(value) {
		return value && typeof value === 'object' && value.constructor === Array;
	}
	
	static isObject(value) {
		return value && typeof value === 'object' && value.constructor === Object;
	}
	
	static isString(value){
		return typeof value === 'string';
	}
	
	static isNumber(value){
		return typeof value === 'number';
	}
	
	static isError(value){
		return value instanceof Error;
	}
	
	static getAndroidVersion(){
		const match = navigator.userAgent.match(/Android\s([0-9\.]+)/);
		return match ? match[1] : null;
	}
	
	static enhanceDispatcher(object, dispatcher){
		if(!dispatcher)
			dispatcher = object.dispatcher = document.createDocumentFragment();
		
		object.trigger = (type, detail) =>
			dispatcher.dispatchEvent(new CustomEvent(`__${type}`, {bubbles:true, detail}));
		
		object.listen = (type, callback) => {
			const listener = event => callback(event.detail, event);
			dispatcher.addEventListener(`__${type}`, listener);
			return listener;
		}
	}
	
	static removeDiacritics(source){
		return source.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	}
	
	static unshiftAndLimit(source, item, length){
		const list = source.filter(i => i !== item)
		list.unshift(item);
		return list.splice(0, length);
	}
	
	// https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
	static uuidv4(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
	
	// variable to be provided by build script
	static getCommitDate(){
		try {
			return new Date(parseFloat(`${COMMIT_DATE}`));
		} catch(error){
			return new Date;
		}
		
	}
}
