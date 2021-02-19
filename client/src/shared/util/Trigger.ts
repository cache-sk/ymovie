namespace ymovie.util.Trigger {
	export function enhance(object:TriggerTarget, dispatcher?:EventTarget) {
		const target:EventTarget = dispatcher || document.createDocumentFragment();
		object.trigger = (action:ActionAny) => {
			target.dispatchEvent(new CustomEvent('__Trigger', {bubbles:true, detail:action}));
		}
		
		object.listen = (type:ListenerType<any, any>, callback:ListenerCallback<any>) => {
			const listener = (event:Event) => {
				if(event instanceof CustomEvent && event.detail instanceof type)
					callback((<ActionAny>event.detail).data, event);
			}
			target.addEventListener('__Trigger', listener);
			return listener;
		}
	}
	
	export type ActionAny = Action<any>;

	export abstract class Action<T> {
		readonly data:T;
		constructor(data:T) {
			this.data = data;
		}
	}

	type TriggerTarget = {
		trigger:Triggerer;
		listen:Listener;
	}

	export type Triggerer = ((action:ActionAny) => void) | undefined;
	export type Listener = (<TData, T extends Action<TData>>(type:ListenerType<TData, T>, callback:ListenerCallback<TData>) => void) | undefined;
	type ListenerType<TData, T> = {new (data:TData):T};
	type ListenerCallback<TData> = (data:TData, event?:CustomEvent) => void;
}
