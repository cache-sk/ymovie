class DetailView extends Dialogue {
	constructor(api){
		super(true);
		this.webshareSetup = new WebshareSetup(api);
		this.streamsView = new StreamsView();

		document.addEventListener("keydown", this.onDocumentKeyDown.bind(this));
		document.addEventListener("touchstart", this.onDocumentTouchStart.bind(this));
		document.addEventListener("touchmove", this.onDocumentTouchMove.bind(this));
		document.addEventListener("touchend", this.onDocumentTouchEnd.bind(this));
	}
	
	get detail(){
		return this.data?.detail;
	}

	renderContent(){
		if(!this.detail)
			return null;
		
		const decorator = ymovie.util.ItemDecorator.create(this.detail);
		return [ymovie.util.DOM.h1(decorator.title),
			ymovie.util.DOM.h2(decorator.subtitle),
			this.renderMetadata(),
			ymovie.util.DOM.p("plot", decorator.plot),
			this.webshareSetup.render(),
			this.streamsView.update()];
	}
	
	update(data){
		if(data){
			this.show();
			this.trigger(Action.RESOLVE_STREAMS, {data:data.detail, callback:this.onStreams.bind(this)});
		}
		return super.update(data);
	}
	
	renderMetadata(){
		const decorator = ymovie.util.ItemDecorator.create(this.detail);
		return ymovie.util.DOM.div("metadata", [
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
	
	renderProperty(className, label, value){
		return value ? ymovie.util.DOM.div(className, [ymovie.util.DOM.span("label", label), ymovie.util.DOM.span("value", value)]) : null;
	}
	
	renderServices(decorator){
		const services = decorator.services;
		if(!services || (!services.csfd && !services.imdb && !services.trakt))
			return null;
		return ymovie.util.DOM.div("services", [ymovie.util.DOM.span("label", "Services"), 
			services.csfd ? ymovie.util.DOM.a(null, "csfd", `https://www.csfd.cz/film/${services.csfd}`, "_blank") : null,
			services.imdb ? ymovie.util.DOM.a(null, "imdb", `https://www.imdb.com/title/${services.imdb}`, "_blank") : null,
			services.trakt ? ymovie.util.DOM.a(null, "trakt", decorator.isSccEpisode
				? `https://trakt.tv/search/trakt/${services.trakt}?id_type=episode`
				: `https://trakt.tv/movies/${services.trakt}`, "_blank") : null,
			services.tmdb && decorator.isSccMovie ? ymovie.util.DOM.a(null, "tmdb", `https://www.themoviedb.org/movie/${services.tmdb}`, "_blank") : null]);
	}

	getTouchX(event){
		return (this.isVisible && event.touches.length == 1) ? event.touches[0].clientX : null;
	}
	
	showPrevious(){
		if(!this.isVisible || !this.data?.list)
			return;

		const list = this.data.list;
		const index = list.indexOf(this.detail);
		if(index != -1 && index > 0)
			this.trigger(Action.SELECT_CATALOGUE_ITEM, list[index - 1]);
	}

	showNext(){
		if(!this.isVisible || !this.data?.list)
			return;

		const list = this.data.list;
		const index = list.indexOf(this.detail);
		if(index != -1 && index < list.length - 1)
			this.trigger(Action.SELECT_CATALOGUE_ITEM, list[index + 1]);
	}

	onPlay(event){
		this.trigger(Action.PLAY, this.detail);
	}
	
	onCloseClick(event){
		this.trigger(Action.BACK);
	}
	
	onStreams(data){
		this.streamsView.update({data:this.detail, streams:data});
	}

	onDocumentKeyDown(event){
		if(event.key == "ArrowLeft")
			this.showPrevious();
		else if(event.key == "ArrowRight")
			this.showNext();
	}

	onDocumentTouchStart(event){
		this.touchStartX = this.getTouchX(event);
	}

	onDocumentTouchMove(event){
		this.touchLastX = this.getTouchX(event);
	}

	onDocumentTouchEnd(event){
		if(this.touchLastX === null || this.touchStartX === null)
			return;
		const diff = (this.touchLastX - this.touchStartX) / this.element.clientWidth;
		if(diff > .5)
			this.showPrevious();
		else if(diff < -.5)
			this.showNext();
	}
}
