namespace ymovie.util {
	export class Util {
		static isArray(value:any):boolean {
			return value && typeof value === 'object' && value.constructor === Array;
		}
		
		static isObject(value:any):boolean {
			return value && typeof value === 'object' && value.constructor === Object;
		}
		
		static isString(value:any):boolean {
			return typeof value === 'string';
		}
		
		static isNumber(value:any):boolean {
			return typeof value === 'number';
		}
		
		static isError(value:any):boolean {
			return value instanceof Error;
		}
		
		static getAndroidVersion():string | undefined {
			const match = navigator.userAgent.match(/Android\s([0-9\.]+)/);
			return match ? match[1] : undefined;
		}
		
		static removeDiacritics(source:string):string {
			// @ts-ignore
			return source.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		}
		
		static unshiftAndLimit<T>(source:Array<T>, item:T, length:number):Array<T> {
			const list = source.filter(i => i !== item)
			list.unshift(item);
			return list.splice(0, length);
		}
		
		// https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
		static uuidv4():string {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		}
		
		// variable to be provided by build script
		static getCommitDate(){
			try {
				return new Date(parseFloat("${COMMIT_DATE}") || 0);
			} catch(error){
				return new Date;
			}
		}

		static formatSize(value:number | undefined):string | undefined {
			if(!value)
				return undefined;
			const mb = value / 1024 / 1024;
			return mb > 100 ? (mb / 1024).toFixed(1) + "G" : mb.toFixed(1) + "M";
		}

		static formatDuration(value:number | undefined):string | undefined {
			if(!value)
				return undefined;
			const iso = new Date(value  * 1000).toISOString().substr(11, 5);
			return iso[0] === "0" ? iso.substr(1) : iso;
		}

		static containsExtension(url:string):boolean {
			var chunks = url.split(".");
			var extension = chunks[chunks.length - 1];
			return extension ? extension.length < 5 : false;
		}
	}
}
