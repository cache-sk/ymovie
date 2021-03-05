namespace ymovie.tv.view.player {
	import Action = type.Action;
	import AudioTrack = type.AudioTrack;
	import DOM = ymovie.util.DOM;
	import Focus = util.Focus;
	import FocusableDataComponent = view.FocusableDataComponent;

	export class AudioTracks extends FocusableDataComponent<HTMLUListElement, Data> {
		private current:AudioTrack;
		private focused:AudioTrack;
		
		private constructor(data:Data) {
			super("ul", data);
			this.current = data.find(item => item.enabled) || data[0]!;
			this.focused = this.current;
		}
/*
		static create2() {
			const list:Data = [
				{enabled:true, id:"", kind:"", label:"", language:"czk"},
				{enabled:false, id:"", kind:"", label:"", language:"slo"},
				{enabled:false, id:"", kind:"", label:"", language:"hun"}
			]
			list.sort(this.sort);
			return new AudioTracks(list);
		}
*/
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
			this.focused = this.current;
			this.render();
			super.focus();
		}

		render() {
			this.clean();
			for(const track of this.data) {
				const li = DOM.create("li", undefined, track.language || "???");
				li.classList.toggle("current", track === this.current);
				li.classList.toggle("focused", track === this.focused);
				this.append(li);
			}
			return super.render();
		}

		executeFocusEvent(event:Focus.Event):boolean {
			const index = this.data.indexOf(this.focused);
			if(event.action === "up" && index > 0) {
				this.focusTrack(this.data[index - 1]!);
				return true;
			}
			if(event.action === "down" && index < this.data.length - 1) {
				this.focusTrack(this.data[index + 1]!);
				return true;
			}
			if(event.action === "submit") {
				this.current = this.focused;
				for(const track of this.data)
					track.enabled = false;
				this.current.enabled = true;
				this.render();
				this.trigger(new Action.AudioTrackSelected(this.current));
			}
			return super.executeFocusEvent(event);
		}

		private focusTrack(value:AudioTrack) {
			this.focused = value;
			this.render();
		}
	}

	type Data = Array<AudioTrack>;
}
