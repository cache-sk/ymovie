class DetailView extends Dialogue {
	constructor(api){
		super(true);
		this.webshareSetup = new WebshareSetup(api);
		this.streamsView = new StreamsView();
	}
	
	renderContent(){
		if(!this.data)
			return null;
		
		const decorator = ItemDecorator.create(this.data);
		return [DOM.h1(decorator.title),
			DOM.h2(decorator.subtitle),
			this.renderMetadata(),
			DOM.p("plot", decorator.plot),
			this.webshareSetup.render(),
			this.streamsView.update()];
	}
	
	update(data){
		if(data){
			this.show();
			this.trigger(Action.RESOLVE_STREAMS, {data, callback:this.onStreams.bind(this)});
		}
		return super.update(data);
	}
	
	renderMetadata(){
		const decorator = ItemDecorator.create(this.data);
		return DOM.div("metadata", [
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
		return value ? DOM.div(className, [DOM.span("label", label), DOM.span("value", value)]) : null;
	}
	
	renderServices(decorator){
		const services = decorator.services;
		if(!services || (!services.csfd && !services.imdb && !services.trakt))
			return null;
		return DOM.div("services", [DOM.span("label", "Services"), 
			services.csfd ? DOM.a(null, "csfd", `https://www.csfd.cz/film/${services.csfd}`, "_blank") : null,
			services.imdb ? DOM.a(null, "imdb", `https://www.imdb.com/title/${services.imdb}`, "_blank") : null,
			services.trakt ? DOM.a(null, "trakt", decorator.isSccEpisode
				? `https://trakt.tv/search/trakt/${services.trakt}?id_type=episode`
				: `https://trakt.tv/movies/${services.trakt}`, "_blank") : null,
			services.tmdb && decorator.isSccMovie ? DOM.a(null, "tmdb", `https://www.themoviedb.org/movie/${services.tmdb}`, "_blank") : null]);
	}
	
	onPlay(event){
		this.trigger(Action.PLAY, this.data);
	}
	
	onCloseClick(event){
		this.trigger(Action.BACK);
	}
	
	onStreams(data){
		this.streamsView.update({data:this.data, streams:data});
	}
}
