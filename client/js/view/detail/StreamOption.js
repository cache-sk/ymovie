class StreamOption extends Component {
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
		
		const textarea = DOM.textarea(null, url);
		textarea.addEventListener("click", this.onClipboard);
		textarea.setAttribute('readonly', '');
		
		const isYoutube = url.indexOf("youtube.com") > -1;
		const download = DOM.a("download", "Download", url, "_blank");
		
		const android = Util.getAndroidVersion()
			? DOM.a("android", "Play on Android", `intent:${url}#Intent;action=android.intent.action.VIEW;type=video/*;end`)
			: null;
		
		const play = DOM.a("play", "Play in new window", isYoutube ? url : `play.html#${encodeURIComponent(url)}`, "_blank");
		
		const cast = DOM.span("cast", "Cast");
		cast.addEventListener("click", () => this.triggerPlay(Player.CAST));
		
		const kodi = DOM.span("kodi", "Play in Kodi");
		kodi.addEventListener("click", () => this.triggerPlay(Player.KODI, 1));
		
		const kodi2 = DOM.span("kodi2", "Play in Kodi");
		kodi2.addEventListener("click", () => this.triggerPlay(Player.KODI, 2));
		
		const vlc = DOM.a("vlc", "Play on VLC", `vlc://${url}`, "_blank");
		
		return DOM.div("options", [textarea, 
			isYoutube ? null : download, 
			isYoutube ? null : android, 
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
