namespace ymovie.web.util {
	export class Storage {
		static get storage() {
			return window.localStorage;
		}
		
		static set(key:string, value:string):void {
			this.storage.setItem(key, value);
		}
		
		static get(key:string):string | null {
			return this.storage.getItem(key);
		}
		
		static remove(key:string):void {
			this.storage.removeItem(key);
		}
	}
}
