namespace ymovie.tv.view.player {
	import Action = ymovie.tv.type.Action;
	import Context = ymovie.tv.type.Context;
	import DOM = ymovie.util.DOM;
	import Focus = util.Focus;
	import Media = ymovie.type.Media;
	import Util = ymovie.util.Util;

	export class PlayerScreen extends Screen {
		private data:PlayerScreenData;
		private video?:HTMLVideoElement;
		private controls = new Controls();
		private seekTimer?:number;
		private idleTimer?:number;

		constructor(context:Context) {
			super(context);

			this.listen(Action.SeekBy, this.onSeekBy.bind(this));
			this.listen(Action.SeekTo, this.onSeekTo.bind(this));
			this.listen(Action.TogglePlay, this.onTogglePlay.bind(this));
			this.element.addEventListener("mousemove", this.onMouseMove.bind(this));
		}

		private set idle(value:boolean) {
			clearTimeout(this.idleTimer);
			this.idleTimer = undefined;
			if(!value) 
				this.idleTimer = setTimeout(() => this.idle = true, 2000);
			this.element.classList.toggle("idle", value);
		}

		private set loading(value:boolean) {
			this.element.classList.toggle("loading", value);
		}

		update(data?:PlayerScreenData):HTMLElement {
			this.data = data;
			this.idle = false;
			this.controls.update({duration:0, currentTime:0});
			return this.render();
		}

		activate(focus:boolean) {
			super.activate(focus);
			this.trigger(new Action.RequestFocus({component:this.controls, element:this.controls.element}));
		}

		deactivate() {
			super.deactivate();
			this.update();
		}

		render() {
			this.clean();
			this.loading = !!this.data;

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
				this.video.addEventListener("error", this.onVideoError.bind(this));
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
		
		private seek(time:number) {
			if(!this.video?.duration)
				return;

			const duration = this.video.duration;
			const currentTime = Math.max(0, Math.min(duration, time));
			this.controls.update({duration, currentTime});

			clearTimeout(this.seekTimer);
			this.seekTimer = setTimeout(this.onApplySeek.bind(this), 1000);
			this.idle = false;
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
			this.loading = true;
		}

		private onVideoSeeked() {
			this.updateControls();
			this.loading = false;
		}

		private onVideoPlaying() {
			this.updateControls();
			this.loading = false;
		}

		private onVideoWaiting() {
			this.updateControls();
			this.loading = true;
		}

		private onVideoPlay() {
			this.updateControls();
		}

		private onVideoPause() {
			this.updateControls();
		}

		private onVideoError() {
			this.loading = false;
			const message = `Playback failed with code <strong>${this.video?.error?.code || 0}</strong> and message <strong>${this.video?.error?.message || 'empty'}</strong>`;
			this.trigger(new Action.ShowNotification({title:"Player Error", message, html:true}));
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
			this.seek(this.controls.data.currentTime + event.detail);
		}

		private onSeekTo(event:CustomEvent<number>) {
			this.seek(event.detail);
		}

		private onApplySeek() {
			clearTimeout(this.seekTimer);
			this.seekTimer = undefined;
			if(this.video)
				this.video.currentTime = this.controls.data.currentTime;
		}

		private onMouseMove() {
			this.idle = false;
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
			this.thumb.addEventListener("click", this.onThumbClick.bind(this));
			this.element.addEventListener("click", this.onClick.bind(this));
		}

		render() {
			this.thumb.style.left = `${(this.data.currentTime / this.data.duration * 100)}%`;
			this.time.innerHTML = `${Util.formatDuration(this.data.currentTime)} / ${Util.formatDuration(this.data.duration)}`;
			return super.render();
		}

		submit() {
			this.trigger(new Action.TogglePlay());
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
				this.submit();
				return true;
			}
			return false;
		}

		onThumbClick(event:MouseEvent) {
			event.stopImmediatePropagation();
			this.submit();
		}

		onClick(event:MouseEvent) {
			const rect = this.element.getBoundingClientRect();
			const time = (event.clientX - rect.x) / rect.width * this.data.duration;
			this.trigger(new Action.SeekTo(time));
		}
	}

	type ConstrolsData = {
		duration:number;
		currentTime:number;
	}
}
