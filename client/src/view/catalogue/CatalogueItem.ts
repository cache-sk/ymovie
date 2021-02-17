namespace ymovie.view.catalogue {
	export class CatalogueItem<TData extends type.Type.AnyCatalogueItem> extends base.DataComponent<HTMLDivElement, TData> {
		constructor(data:TData){
			super("div");
			this.element.classList.add("CatalogueItem");
			this.data = data;
			this.element.addEventListener("click", 
				() => this.trigger?.(this.selectAction));
		}
		
		get selectAction():util.TriggerActionAny {
			return new type.Action.CatalogueItemSelected(<type.Type.AnyCatalogueItem>this.data);
		}
	}
}
