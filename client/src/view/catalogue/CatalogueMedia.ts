namespace ymovie.view.catalogue {
	export class CatalogueMedia extends CatalogueItem<type.Type.Item> {
		static DEFAULT_POSTER_URL = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 8.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5zm9 .5l-2.519 4-2.481-1.96-4 5.96h14l-5-8zm8-4v14h-20v-14h20zm2-2h-24v18h24v-18z"/></svg>';
		
		decorator:util.ItemDecorator;

		static create(data:type.Type.Item, watched:util.WatchedMap){
			return new this(data, watched);
		}
		
		constructor(data:type.Type.Item, watched:util.WatchedMap){
			super(data);
			this.decorator = util.ItemDecorator.create(data);
			this.element.classList.add("CatalogueMedia");
			this.element.classList.toggle('watched', this.isWatched(watched));
		}
		
		isWatched(map:util.WatchedMap){
			if(this.data instanceof type.Type.Movie)
				return map.movies.has(this.data.id);
			if(this.data instanceof type.Type.Series)
				return map.series.has(this.data.id);
			if(this.data instanceof type.Type.Episode)
				return map.episodes.has(this.data.id);
			return false;
		}
		
		render(){
			const decorator = this.decorator;
			const name = ymovie.util.DOM.span("name", this.data?.title);
			const language = this.data?.isCZSK ? ymovie.util.DOM.span("language", "CZ/SK") : null;
			const size = this.data instanceof type.Type.WebshareItem ? util.DOM.span("size", this.data.formatSize) : null;
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
			const url = poster || CatalogueMedia.DEFAULT_POSTER_URL;
			const result = ymovie.util.DOM.img(undefined, url);
			result.width = 100; // mute consoloe warning
			result.loading = "lazy";
			result.onload = this.onImageLoad.bind(this);
			result.onerror = this.onImageError.bind(this);
			result.classList.toggle("missing", !poster);
			return result;
		}
		
		onImageLoad(){
			this.element.classList.add("loaded");
		}
		
		onImageError(event:string | Event){
			const image = <HTMLImageElement>(<Event>event).target;
			image.onerror = null;
			image.src = CatalogueMedia.DEFAULT_POSTER_URL;
			image.classList.add("error");
		}
	}
}
