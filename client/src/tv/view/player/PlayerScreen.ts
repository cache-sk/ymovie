namespace ymovie.tv.view.player {
	import Action = ymovie.tv.type.Action;
	import Context = ymovie.tv.type.Context;
	import DOM = ymovie.util.DOM;
	import Focus = util.Focus;
	import Media = ymovie.type.Media;

	export class PlayerScreen extends Screen {
		private data:PlayerScreenData;
		private video?:HTMLVideoElement;
		private controls = new Controls();
		private seekTimer?:number;
		private idleTimer?:number;
		private previousFocus:Focus.IFocusable | undefined;

		constructor(context:Context) {
			super(context);

			this.listen(Action.SeekBy, this.onSeekBy.bind(this));
			this.listen(Action.TogglePlay, this.onTogglePlay.bind(this));
		}

		private set idle(value:boolean) {
			clearTimeout(this.idleTimer);
			this.idleTimer = undefined;
			if(!value) 
				this.idleTimer = setTimeout(() => this.idle = true, 2000);
			this.element.classList.toggle("idle", value);
		}

		update(data?:PlayerScreenData):HTMLElement {
			this.data = data;
			this.idle = false;
			return this.render();
		}

		activate(currentFocus:Focus.IFocusable | undefined) {
			this.previousFocus = currentFocus;
			super.activate(currentFocus);
			this.trigger(new Action.RequestFocus(this.controls));
		}

		deactivate() {
			super.deactivate();
			this.update();
			if(this.previousFocus)
				this.trigger(new Action.RequestFocus(this.previousFocus));
			this.previousFocus = undefined;
		}

		render() {
			this.clean();

			this.element.classList.toggle("loading", !!this.data);

			if(this.video) {
				this.video.pause();
				this.video.removeAttribute("src");
				this.video.load();
				this.video = undefined;
			}

			if(this.data) {
				this.video = <HTMLVideoElement>DOM.create("video");
				this.video.src = this.data.url;
				this.video.autoplay = true;
				this.video.addEventListener("timeupdate", this.onVideoTimeUpdate.bind(this));
				this.video.addEventListener("loadeddata", this.onVideoLoadedData.bind(this));
				this.video.addEventListener("loadedmetadata", this.onVideoLoadedMetadata.bind(this));
				this.video.addEventListener("seeking", this.onVideoSeeking.bind(this));
				this.video.addEventListener("seeked", this.onVideoSeeked.bind(this));
				this.video.addEventListener("playing", this.onVideoPlaying.bind(this));
				this.video.addEventListener("waiting", this.onVideoWaiting.bind(this));
				this.video.addEventListener("play", this.onVideoPlay.bind(this));
				this.video.addEventListener("pause", this.onVideoPause.bind(this));
				this.append([this.video, this.controls.render()]);
			}

			return super.render();
		}

		private updateControls() {
			if(!this.video)
				return;
			
			const duration = this.video.duration;
			const currentTime = this.seekTimer ? this.controls.data.currentTime : this.video.currentTime;
			this.controls.update({duration, currentTime});

			this.element.classList.toggle("paused", this.video.paused);
		}

		private onVideoTimeUpdate() {
			this.updateControls();
		}

		private onVideoLoadedData() {
			this.updateControls();
		}

		private onVideoLoadedMetadata() {
			this.updateControls();
		}

		private onVideoSeeking() {
			this.updateControls();
			this.element.classList.toggle("loading", true);
		}

		private onVideoSeeked() {
			this.updateControls();
			this.element.classList.toggle("loading", false);
		}

		private onVideoPlaying() {
			this.updateControls();
			this.element.classList.toggle("loading", false);
		}

		private onVideoWaiting() {
			this.updateControls();
			this.element.classList.toggle("loading", true);
		}

		private onVideoPlay() {
			this.updateControls();
		}

		private onVideoPause() {
			this.updateControls();
		}

		private onTogglePlay() {
			if(!this.video)
				return;

			if(this.video.paused)
				this.video.play();
			else
				this.video.pause();
			this.idle = false;
		}

		private onSeekBy(event:CustomEvent<number>) {
			if(!this.video?.duration)
				return;
			const delta = event.detail;
			const duration = this.video.duration;
			const currentTime = Math.max(0, Math.min(duration, this.controls.data.currentTime + delta));
			this.controls.update({duration, currentTime});

			clearTimeout(this.seekTimer);
			this.seekTimer = setTimeout(this.onApplySeek.bind(this), 1000);
			this.idle = false;
		}

		private onApplySeek() {
			clearTimeout(this.seekTimer);
			this.seekTimer = undefined;
			if(!this.video?.duration)
				return;
			this.video.currentTime = this.controls.data.currentTime;
		}
	}

	type PlayerScreenData = undefined | {
		media:Media.Playable;
		stream:Media.Stream;
		url:string;
	}

	class Controls extends FocusableDataComponent<HTMLDivElement, ConstrolsData> {
		private readonly thumb:HTMLDivElement;
		private readonly time:HTMLDivElement;

		constructor() {
			super("div", {duration:0, currentTime:0});

			this.thumb = DOM.div("thumb");
			this.time = DOM.div("time");
			this.append([this.thumb, this.time]);
		}

		render() {
			this.thumb.style.left = `${(this.data.currentTime / this.data.duration * 100)}%`;
			this.time.innerHTML = `${this.formatTime(this.data.currentTime)} / ${this.formatTime(this.data.duration)}`;
			return super.render();
		}

		executeFocusEvent(event:Focus.Event):boolean {
			if(event.action === "right") {
				this.trigger(new Action.SeekBy(30));
				return true;
			}
			if(event.action === "left") {
				this.trigger(new Action.SeekBy(-30));
				return true;
			}
			if(event.action === "submit") {
				this.trigger(new Action.TogglePlay());
				return true;
			}
			return false;
		}

		formatTime(value:number):string {
			let seconds = value | 0;
			let minutes = (seconds / 60) | 0;
			seconds %= 60;
			let hours = (minutes / 60) | 0;
			minutes %= 60;
			return `${hours}:${this.pad(minutes)}:${this.pad(seconds)}`;
		}

		pad(value:number):string {
			return value < 10 ? `0${value}` : value + "";
		}
	}

	type ConstrolsData = {
		duration:number;
		currentTime:number;
	}
}
