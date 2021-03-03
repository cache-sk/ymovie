namespace ymovie.tv.view.player {
	import Action = ymovie.tv.type.Action;
	import Base = ymovie.type.Action.Base;
	import Context = ymovie.tv.type.Context;
	import DOM = ymovie.util.DOM;
	import Focus = util.Focus;
	import Keyboard = util.Keyboard;
	import Media = ymovie.type.Media;
	import Timeout = ymovie.util.Timeout;
	import Util = ymovie.util.Util;

	export class PlayerScreen extends Screen {
		private data:PlayerScreenData;
		private video?:HTMLVideoElement;
		private controls = new Controls();
		private readonly seekTimer = new Timeout(1000);
		private readonly idleTimer = new Timeout(2000);
		private readonly _onGlobalKeyDown = this.onGlobalKeyDown.bind(this);
		private audioTracks:AudioTracks | undefined;

		constructor(context:Context) {
			super(context);

			this.listen(SeekBy, this.onSeekBy.bind(this));
			this.listen(SeekTo, this.onSeekTo.bind(this));
			this.listen(TogglePlay, this.onTogglePlay.bind(this));
			this.listen(ShowControls, this.onShowControls.bind(this));
			this.element.addEventListener("mousemove", this.onMouseMove.bind(this));
		}

		private set idle(value:boolean) {
			this.idleTimer.stop();
			if(!value) 
				this.idleTimer.start(() => this.idle = true);
			this.element.classList.toggle("idle", value);
		}

		update(data?:PlayerScreenData):HTMLElement {
			this.data = data;
			this.idle = !data;
			this.audioTracks = undefined;
			this.seekTimer.stop();
			this.controls.update({duration:0, currentTime:0});
			return this.render();
		}

		activate(focus:boolean) {
			super.activate(focus);
			this.trigger(new Action.RequestFocus({component:this.controls, element:this.controls.element}));
			this.listenGlobal(Action.GlobalKeyDown, this._onGlobalKeyDown);
		}

		deactivate() {
			this.unlistenGlobal(Action.GlobalKeyDown, this._onGlobalKeyDown);
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
			const currentTime = this.seekTimer.running ? this.controls.data.currentTime : this.video.currentTime;
			this.controls.update({duration, currentTime, audioTracks:this.audioTracks});
			this.element.classList.toggle("paused", this.video.paused);
		}
		
		private seek(time:number) {
			if(!this.video?.duration)
				return;

			const duration = this.video.duration;
			const currentTime = Math.max(0, Math.min(duration, time));
			this.controls.update({duration, currentTime});

			this.seekTimer.start(this.onApplySeek.bind(this));
			this.idle = false;
		}

		private play() {
			if(!this.video)
				return;
			this.video.play();
			this.idle = false;
		}

		private togglePlay() {
			if(!this.video)
				return;

			if(this.video.paused)
				this.video.play();
			else
				this.video.pause();
			this.idle = false;
		}

		private stop() {
			this.trigger(new Action.GoBack());
		}

		private onVideoTimeUpdate() {
			this.updateControls();
		}

		private onVideoLoadedData() {
			this.audioTracks = AudioTracks.create((<any>this.video).audioTracks);
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
			const message = `Playback failed with code <strong>${this.video?.error?.code || 0}</strong> and message <strong>${this.video?.error?.message || 'empty'}</strong>.`;
			this.trigger(new Action.ShowNotification({title:"Player Error", message, html:true}));
			this.stop();
		}

		private onTogglePlay() {
			this.togglePlay();
		}

		private onShowControls() {
			this.idle = false;
		}

		private onSeekBy(event:CustomEvent<number>) {
			this.seek(this.controls.data.currentTime + event.detail);
		}

		private onSeekTo(event:CustomEvent<number>) {
			this.seek(event.detail);
		}

		private onApplySeek() {
			if(this.video)
				this.video.currentTime = this.controls.data.currentTime;
		}

		private onMouseMove() {
			this.idle = false;
		}

		private onGlobalKeyDown(event:CustomEvent<KeyboardEvent>) {
			const source = event.detail;
			if(Keyboard.isPlayPause(source)) {
				this.togglePlay();
				source.preventDefault();
			} else if(Keyboard.isPlay(source)) {
				this.play();
				source.preventDefault();
			} else if(Keyboard.isStop(source)) {
				this.stop();
				source.preventDefault();
			}
		}
	}

	type PlayerScreenData = undefined | {
		media:Media.Playable;
		stream:Media.Stream;
		url:string;
	}

	class Controls extends FocusableDataComponent<HTMLDivElement, ConstrolsData> {
		private readonly thumb = DOM.div("thumb");
		private readonly time = DOM.div("time");
		private readonly audioTracks = DOM.div("audioTracks");

		constructor() {
			super("div", {duration:0, currentTime:0});

			this.append([this.thumb, this.time, this.audioTracks]);
			this.thumb.addEventListener("click", this.onThumbClick.bind(this));
			this.element.addEventListener("click", this.onClick.bind(this));
		}

		render() {
			this.thumb.style.left = `${this.data.currentTime / this.data.duration * 100 || 0}%`;
			this.time.innerHTML = `${Util.formatDuration(this.data.currentTime)} / ${Util.formatDuration(this.data.duration)}`;

			DOM.clean(this.audioTracks);
			const tracks = this.data.audioTracks;
			if(tracks)
				for(let i = 0; i < tracks.list.length; i++)
					DOM.append(this.audioTracks, DOM.span(i === tracks.current ? "current" : undefined, tracks.list[i]!.language || "???"));
			

			return super.render();
		}

		submit() {
			this.trigger(new TogglePlay());
		}


		executeFocusEvent(event:Focus.Event):boolean {
			if(event.action === "right") {
				this.trigger(new SeekBy(30));
				return true;
			}
			if(event.action === "left") {
				this.trigger(new SeekBy(-30));
				return true;
			}
			if(event.action === "submit") {
				this.submit();
				return true;
			}
			if(event.action === "down" && this.data.audioTracks) {
				this.data.audioTracks.change();
				this.trigger(new ShowControls());
				this.render();
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
			this.trigger(new SeekTo(time));
		}
	}

	class AudioTracks {
		readonly list:Array<AudioTrack>
		private _current = 0;
		
		private constructor(list:Array<AudioTrack>) {
			this.list = list;
		}

		get current():number {
			return this._current;
		}

		static create(list:Array<AudioTrack> | undefined):AudioTracks | undefined {
			if(list && list.length && list.length > 1)
				return new AudioTracks(list);
			return undefined;
		}

		change() {
			this._current = (this._current >= (this.list.length - 1)) ? 0 : (this._current + 1);
			for(let i = 0; i < this.list.length; i++)
				this.list[i]!.enabled = false;
			this.list[this._current]!.enabled = true;
		}
	}

	type ConstrolsData = {
		readonly duration:number;
		readonly currentTime:number;
		readonly audioTracks?:AudioTracks;
	}

	type AudioTrack = {
		enabled:boolean;
		readonly id:string;
		readonly kind:string;
		readonly label:string;
		readonly language:string;
	}

	class TogglePlay extends Base<undefined> {constructor() {super(undefined);}}
	class ShowControls extends Base<undefined> {constructor() {super(undefined);}}
	class SeekBy extends Base<number> {}
	class SeekTo extends Base<number> {}
}
