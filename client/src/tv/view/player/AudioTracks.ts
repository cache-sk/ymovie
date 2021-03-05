namespace ymovie.tv.view.player {
	import Action = type.Action;
	import AudioTrack = type.AudioTrack;
	import DOM = ymovie.util.DOM;
	import Focus = util.Focus;
	import FocusableDataComponent = view.FocusableDataComponent;

	export class AudioTracks extends FocusableDataComponent<HTMLUListElement, Data> {
		private current:AudioTrack;
		private highlight:AudioTrack;
		
		private constructor(data:Data) {
			super("ul", data);
			this.current = data.find(item => item.enabled) || data[0]!;
			this.highlight = this.current;
		}

		static create(video:HTMLVideoElement):AudioTracks | undefined {
			const source = (<any>video).audioTracks;
			if(!source || !source.length || source.length < 2)
				return undefined;
			const list:Data = [];
			for(let i = 0; i < source.length; i++)
				list.push(source[i]);
			list.sort(this.sort);
			return new AudioTracks(list);
		}

		private static sort(a:AudioTrack, b:AudioTrack) {
			const c = a.language.toUpperCase() || "???";
			const d = b.language.toUpperCase() || "???";
			return (c < d) ? -1 : ((c > d) ? 1 : 0);
		}

		focus() {
			this.highlight = this.current;
			this.render();
			super.focus();
		}

		render() {
			this.clean();
			for(const track of this.data) {
				const li = DOM.create("li", undefined, track.language || "???");
				li.addEventListener("click", () => this.selectTrack(track));
				li.classList.toggle("current", track === this.current);
				li.classList.toggle("focused", track === this.highlight);
				this.append(li);
			}
			return super.render();
		}

		executeFocusEvent(event:Focus.Event):boolean {
			const index = this.data.indexOf(this.highlight);
			if(event.action === "up" && index > 0) {
				this.focusTrack(this.data[index - 1]!);
				return true;
			}
			if(event.action === "down" && index < this.data.length - 1) {
				this.focusTrack(this.data[index + 1]!);
				return true;
			}
			if(event.action === "submit") {
				this.selectTrack(this.highlight);
				return true;
			}
			return super.executeFocusEvent(event);
		}

		private focusTrack(value:AudioTrack) {
			this.highlight = value;
			this.render();
		}

		private selectTrack(value:AudioTrack) {
			this.current = value;
			for(const track of this.data)
				track.enabled = false;
			this.current.enabled = true;
			this.render();
			this.trigger(new Action.AudioTrackSelected(this.current));
		}
	}

	type Data = Array<AudioTrack>;
}
