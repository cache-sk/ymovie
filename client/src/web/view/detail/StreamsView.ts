namespace ymovie.view.detail {
	export class StreamsView extends base.DataComponent<HTMLDivElement, Data> {
		constructor(){
			super("div");
		}
		
		render(){
			this.clean();
			
			this.element.classList.toggle("loading", !this.data);
			if(this.data){
				const data = this.data.data;
				if(data instanceof type.Media.PlayableScc && data.trailers)
					for(const trailer of data.trailers)
						this.append(new StreamTrailer({trailer}).render());
				
				if(this.data.streams?.length)
					this.append(this.data.streams
						.sort((a, b) => (a.size || 0) - (b.size || 0))
						.map(stream => new StreamItem({stream, source:<type.Media.Playable>this.data?.data}).render()));
				else
					this.append(new StreamNA(null).render());
			}
			return super.render();
		}
	}

	type Data = {
		data:type.Media.Playable;
		streams:Array<type.Media.Stream>;
	}
}
