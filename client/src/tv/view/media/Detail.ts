namespace ymovie.tv.view.media {
	import Action = type.Action;
	import DataComponent = ymovie.view.DataComponent;
	import Context = ymovie.tv.type.Context;
	import DOM = ymovie.util.DOM;
	import Focus = util.Focus;
	import Media = ymovie.type.Media;
	import Util = ymovie.util.Util;

	export class Detail extends DataComponent<HTMLDivElement, DetailData> {
		private readonly background:HTMLDivElement;
		private readonly streams:Streams;

		constructor(context:Context) {
			super("div", undefined);

			this.background = DOM.div("background");
			this.streams = new Streams(context);

			this.listenGlobal(Action.StreamsLoaded, this.onStreamsLoaded.bind(this));
		}

		render() {
			this.clean();
			if(this.data instanceof Media.Base) {
				if(this.data.fanart) {
					this.background.style.backgroundImage = `url(${this.data.fanart})`;
					this.append(this.background);
				}
				this.append([this.renderBase(this.data), this.streams.render()]);
			}
			return super.render();
		}

		update(data:DetailData) {
			this.streams.update(undefined);
			return super.update(data);
		}

		renderBase(data:Media.Base) {
			return [DOM.h1(data.longTitle),
				DOM.div("extra", [
					data.rating ? DOM.span("rating", data.rating) : undefined,
					data instanceof Media.Scc && data.year ? DOM.span("year", data.year) : undefined,
					data instanceof Media.PlayableScc && data.duration ? DOM.span("duration", Util.formatDuration(data.duration)) : undefined,
					data instanceof Media.PlayableScc && data.genres ? DOM.span("genres", data.genres) : undefined]),
				data instanceof Media.Scc ? DOM.p("plot", data.plot) : undefined
			];
		}

		onStreamsLoaded(event:CustomEvent<Action.StreamsLoadedData>) {
			const streams = event.detail.streams
				.sort((a, b) => ((a.width || 0) - (b.width || 0)) || ((a.size || 0) - (b.size || 0)));
			this.streams.update({media:event.detail.media, streams});
			const first = this.streams.getFirst();
			if(first)
				this.trigger(new Action.RequestFocus(first));
		}
	}

	export type DetailData = Media.Base | undefined;

	class Streams extends DataComponent<HTMLDivElement, StreamsData> {
		private first:Stream | undefined;
		private readonly pair:Pair;

		constructor(context:Context) {
			super("div", undefined);
			this.pair = new Pair(context.deviceId)
			this.listen(Action.StreamFocused, this.onStreamFocused.bind(this));
		}

		getFirst():Stream | undefined {
			return this.first;
		}

		render() {
			this.clean();
			this.first = undefined;
			this.element.style.transform = "none";
			this.append(this.pair.render());
			if(this.data)
				for(const item of this.data.streams) {
					const stream = new Stream({media:this.data.media, stream:item});
					if(!this.first) this.first = stream;
					this.append(stream.render());
				}
			return super.render();
		}

		onStreamFocused(event:CustomEvent<Action.StreamFocusedData>) {
			const element = event.detail.element;
			this.element.style.transform = `translateY(${-element.offsetTop}px)`;
		}
	}

	type StreamsData = {media:Media.Playable, streams:Array<Media.Stream>} | undefined;

	class Stream extends FocusableDataComponent<HTMLDivElement, StreamData> {
		constructor(data:StreamData) {
			super("div", data);
			this.element.addEventListener("click", this.onClick.bind(this));
		}

		getFocusLayer():string {
			return "stream";
		}

		focus() {
			super.focus();
			this.trigger(new Action.StreamFocused({data:this.data.stream, component:this, element:this.element}));
		}

		submit() {
			this.trigger(new Action.Play(this.data));
		}

		executeFocusEvent(event:Focus.Event):boolean {
			if(event.action === "back" || event.action === "left") {
				this.trigger(new Action.BlurStreams());
				return true;
			} else if(event.action === "submit") {
				this.submit();
				return true;
			}
			return false;
		}

		render() {
			const data = this.data.stream;
			this.clean();
			this.append([
				this.add("resolution", `${data.width}x${data.height}`),
				this.add("size", Util.formatSize(data.size)),
				DOM.div("extra", [
					this.add("language", data.language),
					this.add("subtitles", data.subtitles),
					this.add("hdr", data.hdr ? "HDR" : undefined),
					this.add("3d", data.is3d ? "3D" : undefined),
					this.add("codec", `${data.videoCodec}+${data.audioCodec}`)])]);
			return super.render();
		}

		add(className:string, value:string | undefined | null):DOM.Content {
			return value ? DOM.span(className, value) : undefined;
		}

		onClick() {
			this.focus();
			this.submit();
		}
	}

	type StreamData = {media:Media.Playable, stream:Media.Stream};
}
