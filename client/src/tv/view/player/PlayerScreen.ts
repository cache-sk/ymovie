namespace ymovie.tv.view.player {
	import Action = ymovie.tv.type.Action;
	import Context = ymovie.tv.type.Context;
	import DOM = ymovie.util.DOM;
	import Focus = util.Focus;
	import Media = ymovie.type.Media;

	export class PlayerScreen extends Screen {
		private data:PlayerScreenData;
		private video?:HTMLVideoElement;
		private playButton = new PlayButton();
		private track = new Track();
		private seekTimer?:number;

		constructor(context:Context) {
			super(context);

			this.playButton.element.addEventListener("click", this.onPlayButtonclick.bind(this));

			this.listen(Action.SeekBy, this.onSeekBy.bind(this));
		}

		update(data?:PlayerScreenData):HTMLElement {
			this.data = data;
			return this.render();
		}

		activate(requestFocus:boolean) {
			super.activate(requestFocus);
			this.trigger(new Action.RequestFocus(this.playButton));
		}

		deactivate() {
			super.deactivate();
			this.update();
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
				this.video.addEventListener("timeupdate", this.onVideoTimeUpdate.bind(this));
				this.video.addEventListener("loadeddata", this.onVideoLoadedData.bind(this));
				this.video.addEventListener("loadedmetadata", this.onVideoLoadedMetadata.bind(this));
				this.video.addEventListener("seeking", this.onVideoSeeking.bind(this));
				this.video.addEventListener("seeked", this.onVideoSeeked.bind(this));
				this.video.addEventListener("playing", this.onVideoPlaying.bind(this));
				this.video.addEventListener("waiting", this.onVideoWaiting.bind(this));
				this.video.addEventListener("play", this.onVideoPlay.bind(this));
				this.video.addEventListener("pause", this.onVideoPause.bind(this));
				this.append([this.video, this.playButton.render(), this.track.render()]);
			}

			return super.render();
		}

		updateControls() {
			if(!this.video)
				return;
			
			const duration = this.video.duration;
			const currentTime = this.seekTimer ? this.track.data.currentTime : this.video.currentTime;
			this.track.update({duration, currentTime});

			this.playButton.update(this.video.paused);
		}

		onVideoTimeUpdate() {
			this.updateControls();
		}

		onVideoLoadedData() {
			this.updateControls();
		}

		onVideoLoadedMetadata() {
			this.updateControls();
		}

		onVideoSeeking() {
			this.updateControls();
			this.element.classList.toggle("loading", true);
		}

		onVideoSeeked() {
			this.updateControls();
			this.element.classList.toggle("loading", false);
		}

		onVideoPlaying() {
			this.updateControls();
			this.element.classList.toggle("loading", false);
		}

		onVideoWaiting() {
			this.updateControls();
			this.element.classList.toggle("loading", true);
		}

		onVideoPlay() {
			this.updateControls();
		}

		onVideoPause() {
			this.updateControls();
		}

		onPlayButtonclick() {
			if(!this.video)
				return;

			if(this.video.paused)
				this.video.play();
			else
				this.video.pause();
		}

		onSeekBy(event:CustomEvent<number>) {
			if(!this.video?.duration)
				return;
			const delta = event.detail;
			const duration = this.video.duration;
			const currentTime = Math.max(0, Math.min(duration, this.track.data.currentTime + delta));
			this.track.update({duration, currentTime});

			clearTimeout(this.seekTimer);
			this.seekTimer = setTimeout(this.onApplySeek.bind(this), 1000);
		}

		onApplySeek() {
			this.seekTimer = undefined;
			if(!this.video?.duration)
				return;
			this.video.currentTime = this.track.data.currentTime;
		}
	}

	type PlayerScreenData = undefined | {
		media:Media.Playable;
		stream:Media.Stream;
		url:string;
	}

	class PlayButton extends FocusableDataComponent<HTMLButtonElement, boolean> {
		constructor() {
			super("button", false);
		}

		render() {
			this.element.classList.toggle("paused", this.data);
			this.element.innerHTML = this.data ? "Play" : "Pause";
			return super.render();
		}

		update(data:boolean) {
			return data === this.data ? this.element : super.update(data);
		}

		executeFocusEvent(event:Focus.Event):boolean {
			if(event.action === "submit") {
				this.element.click();
				return true;
			}
			return false;
		}
	}

	class Track extends FocusableDataComponent<HTMLDivElement, TrackData> {
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
			return false;
		}

		formatTime(value:number):string {
			let seconds = value | 0;
			if(seconds < 60)
				return seconds + "";
			let minutes = (seconds / 60) | 0;
			seconds %= 60;
			if(minutes < 60)
				return `${minutes}:${this.pad(seconds)}`;
			let hours = (minutes / 60) | 0;
			minutes %= 60;
			return `${hours}:${this.pad(minutes)}:${this.pad(seconds)}`;
		}

		pad(value:number):string {
			return value < 10 ? `0${value}` : value + "";
		}
	}

	type TrackData = {
		duration:number;
		currentTime:number;
	}
}
