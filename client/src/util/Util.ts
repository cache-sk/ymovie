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
		
		static enhanceDispatcher(object:Dispatcher, dispatcher?:EventTarget):void {
			const target:EventTarget = dispatcher || (object.dispatcher = document.createDocumentFragment());
			object.trigger = (type:string, detail:any) =>
				target.dispatchEvent(new CustomEvent(`__${type}`, {bubbles:true, detail}));
			
			object.listen = (type:string, callback:(detail:any, event:CustomEvent) => void) => {
				const listener = (event:CustomEvent) => callback(event.detail, event);
				target.addEventListener(`__${type}`, <EventListener>listener);
				return listener;
			}
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
	}

	type Dispatcher = {
		dispatcher:EventTarget | undefined;
		trigger:((type:any, detail?:any) => void) | undefined;
		listen:((type:any, callback:(detail:any, event?:CustomEvent) => void) => void) | undefined;
	}
}
