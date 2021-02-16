class StreamOption extends ymovie.view.base.DataComponent {
	constructor(data){
		super("div");
		this.data = data;
		this.element.classList.add("StreamOption");
	}
	
	get url(){
		return this.data.url;
	}
	
	render(){
		this.clean();
		const info = this.renderInfo();
		info.addEventListener("click", this.onClick.bind(this));
		this.append([info, this.renderOptions()]);
		return super.render();
	}
	
	renderInfo(){
	}
	
	renderOptions(){
		const url = this.url;
		if(!url)
			return null;
		
		const textarea = ymovie.util.DOM.textarea(null, url);
		textarea.addEventListener("click", this.onClipboard);
		textarea.setAttribute('readonly', '');
		
		const isYoutube = url.indexOf("youtube.com") > -1;
		const download = ymovie.util.DOM.a("download", "Download", url, "_blank");
		
		const android = ymovie.util.Util.getAndroidVersion()
			? ymovie.util.DOM.a("android", "Play on Android", `intent:${url}#Intent;action=android.intent.action.VIEW;type=video/*;end`)
			: null;
		
		const url2 = ymovie.util.WebshareUtil.containsExtension(url) ? null : `${url}.mkv`;
		const android2 = url2 && ymovie.util.Util.getAndroidVersion()
			? ymovie.util.DOM.a("android fix", "Play on Android", `intent:${url2}#Intent;action=android.intent.action.VIEW;type=video/*;end`)
			: null;
		
		const play = ymovie.util.DOM.a("play", "Play in new window", isYoutube ? url : `play.html#${encodeURIComponent(url)}`, "_blank");
		
		const cast = ymovie.util.DOM.span("cast", "Cast");
		cast.addEventListener("click", () => this.triggerPlay(Player.CAST));
		
		const kodi = ymovie.util.DOM.span("kodi", "Play in Kodi");
		kodi.addEventListener("click", () => this.triggerPlay(Player.KODI, 1));
		
		const kodi2 = ymovie.util.DOM.span("kodi2", "Play in Kodi");
		kodi2.addEventListener("click", () => this.triggerPlay(Player.KODI, 2));
		
		const vlc = ymovie.util.DOM.a("vlc", "Play on VLC", `vlc://${url}`, "_blank");
		
		return ymovie.util.DOM.div("options", [textarea, 
			isYoutube ? null : download, 
			isYoutube ? null : android, 
			isYoutube ? null : android2, 
			play, 
			isYoutube ? null : cast, 
			isYoutube ? null : kodi,
			isYoutube ? null : kodi2,
			isYoutube ? null : vlc]);
	}

	triggerPlay(player, position){
		this.trigger(Action.PLAY, {player, position, data:this.data});
	}

	onClipboard(event){
		event.target.select();
		event.target.setSelectionRange(0, 99999);
		document.execCommand('copy');
	}
}
