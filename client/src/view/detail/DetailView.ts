namespace ymovie.view.detail {
	export class DetailView extends base.Dialogue<Data> {
		webshareSetup:setup.WebshareSetup;
		streamsView:StreamsView;

		touchStartX:number | undefined;
		touchLastX:number | undefined;

		constructor(api:api.Api){
			super(true);
			this.webshareSetup = new setup.WebshareSetup(api);
			this.streamsView = new StreamsView();

			document.addEventListener("keydown", this.onDocumentKeyDown.bind(this));
			document.addEventListener("touchstart", this.onDocumentTouchStart.bind(this));
			document.addEventListener("touchmove", this.onDocumentTouchMove.bind(this));
			document.addEventListener("touchend", this.onDocumentTouchEnd.bind(this));
		}
		
		get detail():type.Type.Playable {
			return <type.Type.Playable>this.data?.detail;
		}

		renderContent():util.DOMContent {
			if(!this.detail)
				return undefined;
			
			const decorator = util.ItemDecorator.create(this.detail);
			return [util.DOM.h1(decorator.title),
				util.DOM.h2(decorator.subtitle),
				this.renderMetadata(),
				util.DOM.p("plot", decorator.plot),
				this.webshareSetup.render(),
				this.streamsView.update()];
		}
		
		update(data:Data) {
			if(data) {
				this.show();
				this.trigger?.(enums.Action.RESOLVE_STREAMS, {data:data.detail, callback:this.onStreams.bind(this)});
			}
			return super.update(data);
		}
		
		renderMetadata(){
			const decorator = util.ItemDecorator.create(this.detail);
			return util.DOM.div("metadata", [
				this.renderProperty("series", "Series", decorator.seriesTitle),
				this.renderProperty("original", "Original Title", decorator.originalTitle),
				this.renderProperty("year", "Year", decorator.year),
				this.renderProperty("genre", "Genre", decorator.inlineGenres),
				this.renderProperty("rating", "Rating", decorator.rating),
				this.renderProperty("mpaa", "MPAA", decorator.mpaa),
				this.renderProperty("director", "Director", decorator.inlineDirectors),
				this.renderProperty("studio", "Studio", decorator.studio),
				this.renderProperty("cast", "Cast", decorator.inlineCast),
				this.renderServices(decorator)
			]);
		}
		
		renderProperty(className:string, label:string, value:util.DOMContent){
			return value ? util.DOM.div(className, [util.DOM.span("label", label), util.DOM.span("value", value)]) : null;
		}
		
		renderServices(decorator:util.ItemDecorator){
			const services = decorator.services;
			if(!services || (!services.csfd && !services.imdb && !services.trakt))
				return null;
			return util.DOM.div("services", [util.DOM.span("label", "Services"), 
				services.csfd ? util.DOM.a(undefined, "csfd", `https://www.csfd.cz/film/${services.csfd}`, "_blank") : null,
				services.imdb ? util.DOM.a(undefined, "imdb", `https://www.imdb.com/title/${services.imdb}`, "_blank") : null,
				services.trakt ? util.DOM.a(undefined, "trakt", decorator.isSccEpisode
					? `https://trakt.tv/search/trakt/${services.trakt}?id_type=episode`
					: `https://trakt.tv/movies/${services.trakt}`, "_blank") : null,
				services.tmdb && decorator.isSccMovie ? util.DOM.a(undefined, "tmdb", `https://www.themoviedb.org/movie/${services.tmdb}`, "_blank") : null]);
		}

		getTouchX(event:TouchEvent):number | undefined {
			return (this.isVisible && event.touches.length == 1) ? event.touches[0].clientX : undefined;
		}
		
		showPrevious(){
			if(!this.isVisible || !this.data?.list)
				return;

			const list = this.data.list;
			const index = list.indexOf(this.detail);
			if(index != -1 && index > 0)
				this.trigger?.(enums.Action.SELECT_CATALOGUE_ITEM, list[index - 1]);
		}

		showNext(){
			if(!this.isVisible || !this.data?.list)
				return;

			const list = this.data.list;
			const index = list.indexOf(this.detail);
			if(index != -1 && index < list.length - 1)
				this.trigger?.(enums.Action.SELECT_CATALOGUE_ITEM, list[index + 1]);
		}

		onPlay(){
			this.trigger?.(enums.Action.PLAY, this.detail);
		}
		
		onCloseClick(){
			this.trigger?.(enums.Action.BACK);
		}
		
		onStreams(data:Array<type.Type.Stream>){
			this.streamsView.update({data:this.detail, streams:data});
		}

		onDocumentKeyDown(event:KeyboardEvent){
			if(event.key == "ArrowLeft")
				this.showPrevious();
			else if(event.key == "ArrowRight")
				this.showNext();
		}

		onDocumentTouchStart(event:TouchEvent){
			this.touchStartX = this.getTouchX(event);
		}

		onDocumentTouchMove(event:TouchEvent){
			this.touchLastX = this.getTouchX(event);
		}

		onDocumentTouchEnd(event:TouchEvent){
			if(this.touchLastX === undefined || this.touchStartX === undefined)
				return;
			const diff = (this.touchLastX - this.touchStartX) / this.element.clientWidth;
			if(diff > .5)
				this.showPrevious();
			else if(diff < -.5)
				this.showNext();
		}
	}

	type Data = {
		detail:type.Type.Playable;
		list:Array<type.Type.AnyCatalogueItem>;
	}
}
