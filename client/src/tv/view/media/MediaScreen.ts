/// <reference path="MediaScreenBase.ts"/>

namespace ymovie.tv.view.media {
	import Focus = ymovie.tv.util.Focus;

	export class MediaScreen extends MediaScreenBase {
		activate(currentFocus:Focus.IFocusable) {
			super.activate(currentFocus);

			if(!this.rowContainer.children.length)
				this.appendCatalogue(this.context.menu, !currentFocus);
		}
	}
}
