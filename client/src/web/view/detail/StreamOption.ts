namespace ymovie.web.view.detail {
	import DataComponent = ymovie.view.DataComponent
	import DOM = ymovie.util.DOM;
	import Media = ymovie.type.Media;
	import Player = type.Player;
	import Util = ymovie.util.Util;

	export class StreamOption<TData extends {source?:Media.Playable, url?:string}> extends DataComponent<HTMLDivElement, TData> {
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
			
			const textarea = DOM.textarea(undefined, url);
			textarea.addEventListener("click", this.onClipboard);
			textarea.setAttribute('readonly', '');
			
			const isYoutube = url.indexOf("youtube.com") > -1;
			const download = DOM.a("download", "Download", url, "_blank");
			
			const android = Util.getAndroidVersion()
				? DOM.a("android", "Play on Android", `intent:${url}#Intent;action=android.intent.action.VIEW;type=video/*;end`)
				: null;
			
			const url2 = Util.containsExtension(url) ? null : `${url}.mkv`;
			const android2 = url2 && Util.getAndroidVersion()
				? DOM.a("android fix", "Play on Android", `intent:${url2}#Intent;action=android.intent.action.VIEW;type=video/*;end`)
				: null;
			
			const play = DOM.a("play", "Play in new window", isYoutube ? url : `play.html#${encodeURIComponent(url)}`, "_blank");
			
			const cast = DOM.span("cast", "Cast");
			cast.addEventListener("click", () => this.triggerPlay(new Player.Cast()));
			
			const kodi = DOM.span("kodi", "Play in Kodi");
			kodi.addEventListener("click", () => this.triggerPlay(new Player.Kodi(1)));
			
			const kodi2 = DOM.span("kodi2", "Play in Kodi");
			kodi2.addEventListener("click", () => this.triggerPlay(new Player.Kodi(2)));
			
			const vlc = DOM.a("vlc", "Play on VLC", `vlc://${url}`, "_blank");
			
			return DOM.div("options", [textarea, 
				isYoutube ? null : download, 
				isYoutube ? null : android, 
				isYoutube ? null : android2, 
				play, 
				isYoutube ? null : cast, 
				isYoutube ? null : kodi,
				isYoutube ? null : kodi2,
				isYoutube ? null : vlc]);
		}

		triggerPlay(player:Player.Base){
			this.trigger?.(new type.Action.Play({player, media:<Media.Playable>this.data?.source, url:<string>this.url}));
		}

		onClipboard(event:MouseEvent){
			const target = <HTMLTextAreaElement>event.target;
			target.select();
			target.setSelectionRange(0, 99999);
			document.execCommand('copy');
		}

		onClick() {}
	}
}
