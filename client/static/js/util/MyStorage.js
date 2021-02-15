class MyStorage {
	static get storage(){
		return window.localStorage;
	}
	
	static set(key, value){
		this.storage.setItem(key, value);
	}
	
	static get(key){
		return this.storage.getItem(key);
	}
	
	static remove(key){
		this.storage.removeItem(key);
	}
}
