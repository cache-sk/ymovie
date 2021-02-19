namespace ymovie.view.detail {
	import DOM = util.DOM;
	import Media = type.Media;

	export class DetailView extends base.Dialogue<Data> {
		private webshareSetup:setup.WebshareSetup;
		private streamsView:StreamsView;

		private touchStartX:number | undefined;
		private touchLastX:number | undefined;
		private canMovePrevious:boolean = false;
		private canMoveNext:boolean = false;

		private _onDocumentTouchStart = this.onDocumentTouchStart.bind(this);
		private _onDocumentTouchMove = this.onDocumentTouchMove.bind(this);
		private _onDocumentTouchEnd = this.onDocumentTouchEnd.bind(this);

		constructor(api:api.Api){
			super(true);
			this.webshareSetup = new setup.WebshareSetup(api);
			this.streamsView = new StreamsView();
		}

		show() {
			super.show();
			document.addEventListener("touchstart", this._onDocumentTouchStart);
			document.addEventListener("touchmove", this._onDocumentTouchMove);
			document.addEventListener("touchend", this._onDocumentTouchEnd);
		}

		hide() {
			document.removeEventListener("touchstart", this._onDocumentTouchStart);
			document.removeEventListener("touchmove", this._onDocumentTouchMove);
			document.removeEventListener("touchend", this._onDocumentTouchEnd);
			super.hide();
		}

		renderContent():util.DOMContent {
			const data = this.data?.detail;
			if(!data)
				return undefined;
			
			return [DOM.h1(data.title),
				data instanceof Media.Episode ? DOM.h2(data.subtitle) : undefined,
				this.renderMetadata(),
				data instanceof Media.PlayableScc ? DOM.p("plot", data.plot) : undefined,
				this.webshareSetup.render(),
				this.streamsView.update()];
		}
		
		update(data:Data) {
			this.translateX = 0;
			if(data) {
				this.show();
				this.trigger?.(new type.Action.ResolveStreams({data:data.detail, callback:this.onStreams.bind(this)}));
			}
			return super.update(data);
		}
		
		renderMetadata(){
			const data = this.data?.detail;
			if(!data)
				return undefined;
			return DOM.div("metadata", [
				data instanceof Media.Season ? this.renderProperty("series", "Series", data.seriesTitle) : undefined,
				data instanceof Media.PlayableScc ? this.renderProperty("original", "Original Title", data.originalTitle) : undefined,
				data instanceof Media.Scc ? this.renderProperty("year", "Year", data.year) : undefined,
				data instanceof Media.PlayableScc ? this.renderProperty("genre", "Genre", data.genres) : undefined,
				this.renderProperty("rating", "Rating", data.rating),
				data instanceof Media.PlayableScc ? this.renderProperty("mpaa", "MPAA", data.mpaa) : undefined,
				data instanceof Media.PlayableScc ? this.renderProperty("director", "Director", data.directors) : undefined,
				data instanceof Media.Scc ? this.renderProperty("studio", "Studio", data.studio) : undefined,
				data instanceof Media.PlayableScc ? this.renderProperty("cast", "Cast", data.cast) : undefined,
				this.renderServices(data)
			]);
		}
		
		renderProperty(className:string, label:string, value:util.DOMContent){
			return value ? DOM.div(className, [DOM.span("label", label), DOM.span("value", value)]) : null;
		}
		
		renderServices(data:Media.PlayableScc){
			const services = data.services;
			if(!services || (!services.csfd && !services.imdb && !services.trakt))
				return null;
			return DOM.div("services", [DOM.span("label", "Services"), 
				services.csfd ? DOM.a(undefined, "csfd", `https://www.csfd.cz/film/${services.csfd}`, "_blank") : null,
				services.imdb ? DOM.a(undefined, "imdb", `https://www.imdb.com/title/${services.imdb}`, "_blank") : null,
				services.trakt ? DOM.a(undefined, "trakt", data instanceof Media.Episode
					? `https://trakt.tv/search/trakt/${services.trakt}?id_type=episode`
					: `https://trakt.tv/movies/${services.trakt}`, "_blank") : null,
				services.tmdb && data instanceof Media.Movie 
					? DOM.a(undefined, "tmdb", `https://www.themoviedb.org/movie/${services.tmdb}`, "_blank") : null]);
		}

		getTouchX(event:TouchEvent):number | undefined {
			return event.touches.length > 0 ? event.touches[0]?.clientX : undefined;
		}
		
		showNext(step:number){
			const item = this.findNext(step);
			if(item)
				this.trigger?.(new type.Action.CatalogueItemSelected({item, replace:true}));
		}
		
		findNext(step:number):Media.Playable | undefined {
			if(!this.data)
				return undefined;
			const list = this.data.list;
			const index = list.indexOf(this.data.detail);
			if(index == -1)
				return undefined;
			for(let i = index + step; i < list.length && i > -1; i += step) {
				const item = list[i];
				if(item instanceof Media.PlayableScc)
					return item;
				if(item instanceof Media.Webshare)
					return item;
			}
			return undefined;
		}

		close(){
			this.trigger?.(new type.Action.GoBack());
		}

		getShowNextStepForTouch():number {
			if(this.touchLastX === undefined || this.touchStartX === undefined)
				return 0;
			const diff = (this.touchLastX - this.touchStartX) / this.element.clientWidth;
			if(diff > .2 && this.canMovePrevious) return -1;
			if(diff < -.2 && this.canMoveNext) return 1;
			return 0;
		}

		transformContent() {
			super.transformContent();
			this.content.style.opacity = (1 - Math.abs(this.translateX / this.element.clientWidth)).toFixed(2);
		}
		
		onStreams(data:Array<Media.Stream>){
			this.streamsView.update({data:<Media.Playable>this.data?.detail, streams:data});
		}

		onDocumentKeyDown(event:KeyboardEvent) {
			super.onDocumentKeyDown(event);
			if(event.key == "ArrowLeft")
				return this.showNext(-1);
			if(event.key == "ArrowRight")
				return this.showNext(1);
		}

		onDocumentTouchStart(event:TouchEvent){
			this.touchStartX = this.getTouchX(event);
			this.canMovePrevious = this.findNext(-1) ? true : false;
			this.canMoveNext = this.findNext(1) ? true : false;
		}

		onDocumentTouchMove(event:TouchEvent){
			this.touchLastX = this.getTouchX(event);
			this.translateX = this.getShowNextStepForTouch() 
				? (this.touchLastX && this.touchStartX ? this.touchLastX - this.touchStartX : 0)
				: 0;
			this.transformContent();
		}

		onDocumentTouchEnd(){
			const step = this.getShowNextStepForTouch();
			if(step)
				this.showNext(step);
			this.touchStartX = undefined;
			this.canMovePrevious = false;
			this.canMoveNext = false;
		}
	}

	type Data = {
		detail:Media.Playable;
		list:Array<type.Catalogue.AnyItem>;
	}
}
