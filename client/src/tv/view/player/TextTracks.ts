namespace ymovie.tv.view.player {
	import Action = type.Action;
	import DOM = ymovie.util.DOM;
	import Focus = util.Focus;
	import FocusableDataComponent = view.FocusableDataComponent;

	export class TextTracks extends FocusableDataComponent<HTMLUListElement, Data> {
		private current:TextTrack;
		private highlight:TextTrack;
		
		private constructor(data:Data, none:TextTrack) {
			super("ul", data);
			this.current = data.find(item => item.mode === "showing") || none;
			this.highlight = this.current;
		}

		static create2(_video:HTMLVideoElement):TextTracks {
			const none = <TextTrack>{language: "off"};
			const list:Data = [
				<TextTrack>{language: "???"},
				<TextTrack>{language: "???"},
				none,
			]
			return new TextTracks(list, none);
		}

		static create(video:HTMLVideoElement):TextTracks | undefined {
			const source = video.textTracks;
			const none = video.addTextTrack("captions", "off", "off");
			if(!source || !source.length || source.length < 1)
				return undefined;
			const list:Data = [];
			for(let i = 0; i < source.length; i++)
				list.push(source[i]!);
			return new TextTracks(list, none);
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
			if(event.action === "up") {
				if(index > 0)
					this.focusTrack(this.data[index - 1]!);
				return true;
			}
			if(event.action === "down") {
				if(index < this.data.length - 1)
					this.focusTrack(this.data[index + 1]!);
				return true;
			}
			if(event.action === "submit") {
				this.selectTrack(this.highlight);
				return true;
			}
			return super.executeFocusEvent(event);
		}

		private focusTrack(value:TextTrack) {
			this.highlight = value;
			this.render();
		}

		private selectTrack(value:TextTrack) {
			this.current = value;
			for(const track of this.data)
				track.mode = "disabled";
			if(this.current)
				this.current.mode = "showing";
			this.render();
			this.trigger(new Action.TextTrackSelected(this.current));
		}

		getBoundingRect():Focus.Rect | undefined {
			const rect = super.getBoundingRect();
			const body = document.body;
			return rect ? new Focus.Rect(rect.x + body.clientWidth, 0, rect.width, body.clientHeight) : undefined;
		}
	}

	type Data = Array<TextTrack>;
}
