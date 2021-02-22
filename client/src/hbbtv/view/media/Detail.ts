namespace ymovie.hbbtv.view.media {
	import DataComponent = ymovie.view.DataComponent;
	import DOM = ymovie.util.DOM;
	import Media = ymovie.type.Media;

	export class Detail extends DataComponent<HTMLDivElement, DetailData> {
		private readonly background:HTMLDivElement;

		constructor() {
			super("div", undefined);

			this.background = DOM.div("background");
		}

		render() {
			this.clean();
			if(this.data instanceof Media.Base)
				this.append([this.background, this.renderBase(this.data)]);
			else
				this.background.style.backgroundImage = "none";
			return super.render();
		}

		renderBase(data:Media.Base) {
			this.background.style.backgroundImage = data.fanart ? `url(${data.fanart})` : "none";
			return [DOM.h1(data.longTitle),
				data instanceof Media.Scc ? DOM.p(undefined, data.plot) : undefined
			];
		}
	}

	export type DetailData = Media.Base | undefined;
}
