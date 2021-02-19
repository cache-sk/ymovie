namespace ymovie.web.view.catalogue {
	export class CatalogueItem<TData extends type.Catalogue.AnyItem> extends DataComponent<HTMLDivElement, TData> {
		constructor(data:TData){
			super("div");
			this.element.classList.add("CatalogueItem");
			this.data = data;
			this.element.addEventListener("click", 
				() => this.trigger?.(this.selectAction));
		}
		
		get selectAction():util.Trigger.ActionAny {
			return new type.Action.CatalogueItemSelected({item:<type.Catalogue.AnyItem>this.data});
		}
	}
}
