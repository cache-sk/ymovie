namespace ymovie.view.detail {
	export class StreamOption<TData extends {url?:string}> extends base.DataComponent<HTMLDivElement, TData> {
		constructor(data:TData){
			super("div");
			this.data = data;
			this.element.classList.add("StreamOption");
		}
		
		get url(){
			return this.data?.url;
		}
		
		render(){
			this.clean();
			const info = this.renderInfo();
			info?.addEventListener("click", this.onClick.bind(this));
			this.append([info, this.renderOptions()]);
			return super.render();
		}
		
		renderInfo():HTMLElement | undefined {
			return undefined;
		}
		
		renderOptions(){
			const url = this.url;
			if(!url)
				return null;
			
			const textarea = util.DOM.textarea(undefined, url);
			textarea.addEventListener("click", this.onClipboard);
			textarea.setAttribute('readonly', '');
			
			const isYoutube = url.indexOf("youtube.com") > -1;
			const download = util.DOM.a("download", "Download", url, "_blank");
			
			const android = util.Util.getAndroidVersion()
				? util.DOM.a("android", "Play on Android", `intent:${url}#Intent;action=android.intent.action.VIEW;type=video/*;end`)
				: null;
			
			const url2 = util.WebshareUtil.containsExtension(url) ? null : `${url}.mkv`;
			const android2 = url2 && util.Util.getAndroidVersion()
				? util.DOM.a("android fix", "Play on Android", `intent:${url2}#Intent;action=android.intent.action.VIEW;type=video/*;end`)
				: null;
			
			const play = util.DOM.a("play", "Play in new window", isYoutube ? url : `play.html#${encodeURIComponent(url)}`, "_blank");
			
			const cast = util.DOM.span("cast", "Cast");
			cast.addEventListener("click", () => this.triggerPlay(enums.Player.CAST));
			
			const kodi = util.DOM.span("kodi", "Play in Kodi");
			kodi.addEventListener("click", () => this.triggerPlay(enums.Player.KODI, 1));
			
			const kodi2 = util.DOM.span("kodi2", "Play in Kodi");
			kodi2.addEventListener("click", () => this.triggerPlay(enums.Player.KODI, 2));
			
			const vlc = util.DOM.a("vlc", "Play on VLC", `vlc://${url}`, "_blank");
			
			return util.DOM.div("options", [textarea, 
				isYoutube ? null : download, 
				isYoutube ? null : android, 
				isYoutube ? null : android2, 
				play, 
				isYoutube ? null : cast, 
				isYoutube ? null : kodi,
				isYoutube ? null : kodi2,
				isYoutube ? null : vlc]);
		}

		triggerPlay(player:enums.Player, position?:number){
			this.trigger?.(enums.Action.PLAY, <type.Type.ActionPlayPayload>{player, position, data:this.data});
		}

		onClipboard(event:MouseEvent){
			const target = <HTMLTextAreaElement>event.target;
			target.select();
			target.setSelectionRange(0, 99999);
			document.execCommand('copy');
		}

		onClick() {
		}
	}
}
