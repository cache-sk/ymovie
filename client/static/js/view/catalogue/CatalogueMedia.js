class CatalogueMedia extends CatalogueItem {
	static DEFAULT_POSTER_URL = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 8.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5zm9 .5l-2.519 4-2.481-1.96-4 5.96h14l-5-8zm8-4v14h-20v-14h20zm2-2h-24v18h24v-18z"/></svg>';
	
	static create(data, watched){
		return new this(data, watched);
	}
	
	constructor(data, watched){
		super(data);
		this.decorator = ymovie.util.ItemDecorator.create(data);
		this.element.classList.add("CatalogueMedia");
		this.element.classList.toggle('watched', this.isWatched(watched));
	}
	
	isWatched(map){
		const decorator = this.decorator;
		const id = decorator.id;
		if(decorator.isSccMovie)
			return map.movies.has(decorator.id);
		if(decorator.isSccSeries)
			return map.series.has(decorator.id);
		if(decorator.isSccEpisode)
			return map.episodes.has(decorator.id);
		return false;
	}
	
	render(){
		const decorator = this.decorator;
		const name = ymovie.util.DOM.span("name", decorator.title);
		const language = decorator.isCZSK ? ymovie.util.DOM.span("language", "CZ/SK") : null;
		const size = decorator.size ? ymovie.util.DOM.span("size", decorator.formatSize) : null;
		const year = decorator.year ? ymovie.util.DOM.span("year", decorator.year) : null;
		const title = ymovie.util.DOM.span("title", [name, language, size || year]);
		const rating = decorator.rating ? ymovie.util.DOM.span("rating", decorator.rating) : null;
		const img = this.renderPoster();
		this.append([img, title, rating]);
		this.element.classList.toggle('playable', decorator.isPlayable);
		return super.render();
	}
	
	renderPoster(){
		const poster = this.decorator.posterThumbnail;
		const url = poster || this.constructor.DEFAULT_POSTER_URL;
		const result = ymovie.util.DOM.img(null, url);
		result.width = 100; // mute consoloe warning
		result.loading = "lazy";
		result.onload = this.onImageLoad.bind(this);
		result.onerror = this.onImageError.bind(this);
		result.classList.toggle("missing", !poster);
		return result;
	}
	
	onImageLoad(event){
		this.element.classList.add("loaded");
	}
	
	onImageError(event){
		event.target.onerror = null;
		event.target.src = this.constructor.DEFAULT_POSTER_URL;
		event.target.classList.add("error");
	}
}
