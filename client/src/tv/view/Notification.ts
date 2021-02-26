namespace ymovie.tv.view {
	import Action = ymovie.tv.type.Action;
	import DataComponent = ymovie.view.DataComponent;
	import DOM = ymovie.util.DOM;

	export class Notification extends DataComponent<HTMLDivElement, Data> {
		private hideTimeout:number | undefined;
		private readonly hideTimeoutInterval = 3000;

		constructor() {
			super("div", undefined);
		}

		stopTimeout() {
			clearTimeout(this.hideTimeout);
			this.hideTimeout = undefined;
		}

		private set visible(value:boolean) {
			this.element.classList.toggle("visible", value);
		}

		update(data:Data) {
			this.stopTimeout();
			if(data)
				this.hideTimeout = setTimeout(() => this.visible = false, this.hideTimeoutInterval);
			return super.update(data);
		}

		render() {
			this.clean();
			this.visible = !!this.data;
			if(this.data) {
				const p = DOM.p(undefined);
				if(this.data.html)
					p.innerHTML = this.data.message;
				else
					p.textContent = this.data.message;
				this.append([DOM.h1(this.data.title), p]);
			}
			return super.render();
		}
	}

	type Data = Action.ShowNotificationData | undefined;
}
