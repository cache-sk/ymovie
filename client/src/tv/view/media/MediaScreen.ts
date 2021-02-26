/// <reference path="MediaScreenBase.ts"/>

namespace ymovie.tv.view.media {
	export class MediaScreen extends MediaScreenBase {
		activate(focus:boolean) {
			super.activate(focus);
			if(!this.rowContainer.children.length)
				this.appendCatalogue(this.context.menu, focus);
		}
	}
}
