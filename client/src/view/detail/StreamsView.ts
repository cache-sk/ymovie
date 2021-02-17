namespace ymovie.view.detail {
	export class StreamsView extends base.DataComponent<HTMLDivElement, type.Type.PlayableStreams> {
		constructor(){
			super("div");
		}
		
		render(){
			this.clean();
			
			this.element.classList.toggle("loading", !this.data);
			if(this.data){
				const decorator = util.ItemDecorator.create(this.data.data);
				if(decorator.trailers)
					for(const trailer of decorator.trailers)
						this.append(StreamTrailer.create({trailer}).render());
				
				if(this.data.streams?.length)
					this.append(this.data.streams
						.sort((a, b) => (a.size || 0) - (b.size || 0))
						.map(stream => StreamItem.create({stream, source:<type.Type.Playable>this.data?.data}).render()));
				else
					this.append(StreamNA.create().render());
			}
			return super.render();
		}
	}
}
