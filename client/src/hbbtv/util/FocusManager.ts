namespace ymovie.hbbtv.util {
	import FocusAction = enums.FocusAction;
	import FocusEvent = type.FocusEvent;

	export class FocusManager {
		focusedComponentChanged:((component:IFocusableComponent) => void) | undefined;

		private _focusedComponent:IFocusableComponent | undefined;
		private readonly components:Array<IFocusableComponent> = [];

		private virtualXOffset:number = 0;
		private virtualYOffset:number = 0;

		constructor() {
		}

		set focusedComponent(value:IFocusableComponent) {
			if(this._focusedComponent == value)
				return;
			
			if(this._focusedComponent != null)
			this._focusedComponent.focused = false;

			this._focusedComponent = value;

			if(this._focusedComponent != null) {
				this.addComponent(this._focusedComponent);
				this._focusedComponent.focused = true;
			}
			this.virtualXOffset = 0;
			this.virtualYOffset = 0;

			this.focusedComponentChanged?.(this._focusedComponent);
		}

		private getVirtualX():number {
			return this._focusedComponent ? this._focusedComponent.boundingRect.centerX + this.virtualXOffset : 0;
		}

		private getVirtualY():number {
			return this._focusedComponent ? this._focusedComponent.boundingRect.centerY + this.virtualYOffset : 0;
		}

		executeEvent(event:FocusEvent):boolean {
			const focusedComponent = this._focusedComponent;
			if(!focusedComponent)
				return false;

			var	customEvent = focusedComponent.getComponentSpecificFocusEvent(event);
			if(focusedComponent.executeFocusEvent(customEvent))
				return true;
			
			if(!FocusActionUtil.isDirection(customEvent.action))
				return false;

			var nearest = this.getNearest(focusedComponent, customEvent);
			if(nearest != null)
			{
				var x = this.getVirtualX();
				var y = this.getVirtualY();
				this.focusedComponent = nearest;
				this.optimizeVirtualPosition(customEvent.action, x, y, focusedComponent.boundingRect);
				return true;
			}

			return false;
		}

		addComponent(view:IFocusableComponent) {
			if(this.components.indexOf(view) == -1)
				this.components.push(view);
		}

		removeComponent(view:IFocusableComponent) {
			const index = this.components.indexOf(view, 0);
			if (index > -1)
				this.components.splice(index, 1);
		}

		getNearest(component:IFocusableComponent, event:FocusEvent):IFocusableComponent | undefined {
			const action = event.action;
			const virtualX = this.getVirtualX();
			const virtualY = this.getVirtualY();

			let rect = new Rect(virtualX, virtualY, 0, 0);
			let result = this.getNearestForRect(component, rect, virtualX, virtualY, action);
			if(result != null)
				return result;

			const componentRect = component.boundingRect;
			result = this.getNearestForRect(component, componentRect, virtualX, virtualY, action);
			if(result)
				return result;

			if(action == FocusAction.LEFT && component.allowHorizontalCirculation(event)) {
				rect = new Rect(Number.MAX_SAFE_INTEGER, componentRect.y, componentRect.width, componentRect.height);
				return this.getNearestForRect(component, rect, Number.MAX_SAFE_INTEGER, virtualY, action);
			}

			if(action == FocusAction.RIGHT && component.allowHorizontalCirculation(event)) {
				rect = new Rect(Number.MIN_SAFE_INTEGER, componentRect.y, componentRect.width, componentRect.height);
				return this.getNearestForRect(component, rect, Number.MIN_SAFE_INTEGER, virtualY, action);
			}

			return undefined;
		}

		private getNearestForRect(component:IFocusableComponent, componentRect:Rect, virtualX:number, virtualY:number,
			action:enums.FocusAction):IFocusableComponent | undefined {
			let result:IFocusableComponent | undefined;
			var resultDistanceX = Number.POSITIVE_INFINITY;
			var resultDistanceY = Number.POSITIVE_INFINITY;
			for(let item of this.components) {
				if(component == item || component.focusLayer != item.focusLayer)
					continue;

				var itemRect = item.boundingRect;
				if(this.inDirection(action, itemRect, componentRect) && this.overlaps(action, itemRect, componentRect)) {
					var itemDistanceX = this.calculateDistance(virtualX, itemRect.x, itemRect.right);
					var itemDistanceY = this.calculateDistance(virtualY, itemRect.y, itemRect.bottom);
					if(this.isCloser(action, itemDistanceX, itemDistanceY, resultDistanceX, resultDistanceY)) {
						result = item;
						resultDistanceX = itemDistanceX;
						resultDistanceY = itemDistanceY;
					}
				}
			}
			return result;
		}

		private calculateDistance(position:number, left:number, right:number):number {
			return Math.min(Math.abs(position - left), Math.abs(position - right));
		}

		private isCloser(action:enums.FocusAction, itemDistanceX:number, itemDistanceY:number, distanceX:number, distanceY:number):boolean {
			if(action == FocusAction.UP || action == FocusAction.DOWN)
				return itemDistanceY < distanceY || (itemDistanceY == distanceY && itemDistanceX < distanceX);
			if(action == FocusAction.LEFT || action == FocusAction.RIGHT)
				return itemDistanceX < distanceX || (itemDistanceX == distanceX && itemDistanceY < distanceY);
			return false;
		}

		private optimizeVirtualPosition(action:FocusAction, previousX:number, previousY:number, rect:Rect) {
			if(action == FocusAction.LEFT || action == FocusAction.RIGHT)
				this.virtualYOffset = (previousY >= rect.y && previousY <= rect.bottom) ? previousY - rect.centerY : 0;
			else if(action == FocusAction.UP || action == FocusAction.DOWN)
				this.virtualXOffset = (previousX >= rect.x && previousX <= rect.right) ? previousX - rect.centerX : 0;
		}

		private inDirection(action:FocusAction, r1:Rect, r2:Rect):boolean {
			return (action == FocusAction.LEFT && r1.centerX < r2.centerX)
				|| (action == FocusAction.RIGHT && r1.centerX > r2.centerX)
				|| (action == FocusAction.UP && r1.centerY < r2.centerY)
				|| (action == FocusAction.DOWN && r1.centerY > r2.centerY);
		}

		private overlaps(action:FocusAction, r1:Rect, r2:Rect):boolean {
			var horizontal = FocusActionUtil.isHorizontal(action);
			return (horizontal && this.overlapsHorizontal(r1, r2))
				|| (!horizontal && this.overlapsVertical(r1, r2));
		}

		private overlapsHorizontal(r1:Rect, r2:Rect):boolean {
			return (r1.centerY > r2.y && r1.centerY < r2.y + r2.height)
				|| (r2.centerY > r1.y && r2.centerY < r1.y + r1.height);
		}

		private overlapsVertical(r1:Rect, r2:Rect):boolean {
			return (r1.centerX > r2.x && r1.centerX < r2.x + r2.width)
				|| (r2.centerX > r1.x && r2.centerX < r1.x + r1.width);
		}
	}

	interface IFocusableComponent {
		focused:boolean;
		boundingRect:Rect;
		focusLayer:String;
		allowAutoFocus:boolean;

		executeFocusEvent(event:FocusEvent):boolean;
		allowHorizontalCirculation(event:FocusEvent):boolean;
		getComponentSpecificFocusEvent(event:FocusEvent):FocusEvent;

		/*
		var focused(default, set):Bool;
		var boundingRect(get, never):Rect<Float>;
		var focusLayer(get, never):String;
		var allowAutoFocus(get, never):Bool;
	
		function executeFocusEvent(event:FocusEvent):Bool;
		function allowHorizontalCirculation(event:FocusEvent):Bool;
		function getComponentSpecificFocusEvent(event:FocusEvent):FocusEvent;
		*/
	}

	class Rect {
		readonly x:number;
		readonly y:number;
		readonly width:number;
		readonly height:number;
		readonly centerX:number;
		readonly centerY:number;
		readonly right:number;
		readonly bottom:number;

		constructor(x:number, y:number, width:number, height:number) {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			this.centerX = x + (width / 2);
			this.centerY = y + (height / 2);
			this.right = x + width;
			this.bottom = y + height;
		}
	}

	class FocusActionUtil {
		static isDirection(action:FocusAction):boolean {
			return action == FocusAction.LEFT || action == FocusAction.RIGHT || action == FocusAction.UP || action == FocusAction.DOWN;
		}

		static isHorizontal(action:FocusAction):boolean {
			return action == FocusAction.LEFT || action == FocusAction.RIGHT;
		}
	}
}
