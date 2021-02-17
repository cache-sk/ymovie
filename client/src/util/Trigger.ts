namespace ymovie.util {
	export class Trigger {
		static enhance(object:TriggerTarget, dispatcher?:EventTarget):void {
			const target:EventTarget = dispatcher || document.createDocumentFragment();
			object.trigger = (action:TriggerActionAny) => {
				target.dispatchEvent(new CustomEvent('__Trigger', {bubbles:true, detail:action}));
			}
			
			object.listen = (type:ListenerType<any, any>, callback:ListenerCallback<any>) => {
				const listener = (event:Event) => {
					if(event instanceof CustomEvent && event.detail instanceof type)
						callback((<TriggerActionAny>event.detail).data, event);
				}
				target.addEventListener('__Trigger', listener);
				return listener;
			}
		}
	}

	export type TriggerActionAny = TriggerAction<any>;

	export abstract class TriggerAction<T> {
		readonly data:T;
		constructor(data:T) {
			this.data = data;
		}
	}

	type TriggerTarget = {
		trigger:Triggerer;
		listen:TriggerListener;
	}

	export type Triggerer = ((action:TriggerActionAny) => void) | undefined;
	export type TriggerListener = (<TData, T extends TriggerAction<TData>>(type:ListenerType<TData, T>, callback:ListenerCallback<TData>) => void) | undefined;
	type ListenerType<TData, T> = {new (data:TData):T};
	type ListenerCallback<TData> = (data:TData, event?:CustomEvent) => void;
}
