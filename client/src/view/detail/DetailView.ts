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

		renderContent():util.DOMContent {
			const data = this.data?.detail;
			if(!data)
				return undefined;
			
			return [util.DOM.h1(data.title),
				data instanceof type.Media.Episode ? util.DOM.h2(data.subtitle) : undefined,
				this.renderMetadata(),
				data instanceof type.Media.PlayableScc ? util.DOM.p("plot", data.plot) : undefined,
				this.webshareSetup.render(),
				this.streamsView.update()];
		}
		
		update(data:Data) {
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
			return util.DOM.div("metadata", [
				data instanceof type.Media.Season ? this.renderProperty("series", "Series", data.seriesTitle) : undefined,
				data instanceof type.Media.PlayableScc ? this.renderProperty("original", "Original Title", data.originalTitle) : undefined,
				data instanceof type.Media.Scc ? this.renderProperty("year", "Year", data.year) : undefined,
				data instanceof type.Media.PlayableScc ? this.renderProperty("genre", "Genre", data.genres) : undefined,
				this.renderProperty("rating", "Rating", data.rating),
				data instanceof type.Media.PlayableScc ? this.renderProperty("mpaa", "MPAA", data.mpaa) : undefined,
				data instanceof type.Media.PlayableScc ? this.renderProperty("director", "Director", data.directors) : undefined,
				data instanceof type.Media.Scc ? this.renderProperty("studio", "Studio", data.studio) : undefined,
				data instanceof type.Media.PlayableScc ? this.renderProperty("cast", "Cast", data.cast) : undefined,
				this.renderServices(data)
			]);
		}
		
		renderProperty(className:string, label:string, value:util.DOMContent){
			return value ? util.DOM.div(className, [util.DOM.span("label", label), util.DOM.span("value", value)]) : null;
		}
		
		renderServices(data:type.Media.PlayableScc){
			const services = data.services;
			if(!services || (!services.csfd && !services.imdb && !services.trakt))
				return null;
			return util.DOM.div("services", [util.DOM.span("label", "Services"), 
				services.csfd ? util.DOM.a(undefined, "csfd", `https://www.csfd.cz/film/${services.csfd}`, "_blank") : null,
				services.imdb ? util.DOM.a(undefined, "imdb", `https://www.imdb.com/title/${services.imdb}`, "_blank") : null,
				services.trakt ? util.DOM.a(undefined, "trakt", data instanceof type.Media.Episode
					? `https://trakt.tv/search/trakt/${services.trakt}?id_type=episode`
					: `https://trakt.tv/movies/${services.trakt}`, "_blank") : null,
				services.tmdb && data instanceof type.Media.Movie 
					? util.DOM.a(undefined, "tmdb", `https://www.themoviedb.org/movie/${services.tmdb}`, "_blank") : null]);
		}

		getTouchX(event:TouchEvent):number | undefined {
			return (this.isVisible && event.touches.length == 1) ? event.touches[0]?.clientX : undefined;
		}
		
		showPrevious(){
			if(!this.isVisible || !this.data?.list)
				return;

			const list = this.data.list;
			const index = list.indexOf(this.data.detail);
			const item = index != -1 && index > 0 ? list[index - 1] : null;
			if(item)
				this.trigger?.(new type.Action.CatalogueItemSelected(item));
		}

		showNext(){
			if(!this.isVisible || !this.data?.list)
				return;

			const list = this.data.list;
			const index = list.indexOf(this.data.detail);
			const item = index != -1 && index < list.length - 1 ? list[index + 1] : null;
			if(item)
				this.trigger?.(new type.Action.CatalogueItemSelected(item));
		}
		
		onCloseClick(){
			this.trigger?.(new type.Action.GoBack(undefined));
		}
		
		onStreams(data:Array<type.Type.Stream>){
			this.streamsView.update({data:<type.Media.Playable>this.data?.detail, streams:data});
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

		onDocumentTouchEnd(){
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
		detail:type.Media.Playable;
		list:Array<type.Catalogue.AnyItem>;
	}
}
