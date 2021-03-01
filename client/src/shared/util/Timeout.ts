namespace ymovie.util {
	export class Timeout {
		private readonly interval:number;
		private id:number | undefined;

		constructor(interval:number) {
			this.interval = interval;
		}

		start(handler:Function) {
			this.stop();
			this.id = setTimeout(handler, this.interval);
		}

		stop() {
			clearTimeout(this.id);
			this.id = undefined;
		}
	}
}