namespace ymovie.tv.view.search {
	import Action = ymovie.tv.type.Action;
	import Context = ymovie.tv.type.Context;
	import DOM = ymovie.util.DOM;

	export class SearchScreen extends Screen {
		private readonly osk = new OSK();
		private readonly input = DOM.input(undefined, "q", "", "Search query");

		constructor(context:Context) {
			super(context);

			this.append([
				this.osk.render(),
				this.input
			]);

			this.osk.listen(Action.OSKKey, this.onOSKKey.bind(this));
		}

		private onOSKKey(event:CustomEvent<Action.OSKKeyData>) {
			const {type, value} = event.detail;
			if(type === "del")
				this.input.value = this.input.value.substr(0, Math.max(this.input.value.length - 1, 0));
			else if(type === "space")
				this.input.value += " ";
			else
				this.input.value += value;
		}
	}
}
