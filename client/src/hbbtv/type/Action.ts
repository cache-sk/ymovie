namespace ymovie.hbbtv.type.Action {
	import Base = ymovie.type.Action.Base;
	import Focus = util.Focus;

	export class RegisterFocusable extends Base<Array<Focus.IFocusable>> {
		constructor() {
			super([]);
		}
	}
}
