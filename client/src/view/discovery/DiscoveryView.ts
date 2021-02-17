namespace ymovie.view.discovery {
	export class DiscoveryView extends base.DataComponent<HTMLDivElement, Data> {
		catalogue:catalogue.Catalogue;
		header:DiscoveryHeader;

		constructor(){
			super("div");
			
			this.catalogue = new catalogue.Catalogue();
			this.catalogue.element.addEventListener("touchstart", this.onCatalogueTouchStart.bind(this));
			this.header = new DiscoveryHeader();
			this.append([this.catalogue.render(), this.header.render()]);
		}
		
		set searchQuery(value:string) {
			this.header.searchQuery = value;
		}
		
		render(){
			const list = this.element.classList;
			for(let i = 0; i < list.length; i++)
				this.validateClassName(list[i]);

			if(this.data?.type)
				this.element.classList.toggle(`type-${this.data.type}`, true);
			return super.render();
		}
		
		validateClassName(value:string) {
			if(value.startsWith("type-") && (!this.data?.type || value != `type-${this.data.type}`))
				this.element.classList.toggle(value, false);
		}
		
		update(data:Data) {
			this.catalogue.update(data.catalogue);
			return super.update(data);
		}
		
		// unfocus search input on mobile
		onCatalogueTouchStart(){
			if(document.activeElement?.tagName === "INPUT")
				(<HTMLInputElement>document.activeElement).blur();
		}
	}

	type Data = {
		type?:string;
		catalogue:Array<type.Type.AnyCatalogueItem> | Error | undefined;
	}
}
