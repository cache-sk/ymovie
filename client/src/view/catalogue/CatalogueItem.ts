namespace ymovie.view.catalogue {
	export class CatalogueItem<TData> extends base.DataComponent<HTMLDivElement, TData> {
		constructor(data:TData){
			super("div");
			this.element.classList.add("CatalogueItem");
			this.data = data;
			this.element.addEventListener("click", 
				event => this.trigger?.(this.selectAction, this.selectData));
		}
		
		get selectAction():enums.Action | undefined {
			return enums.Action.SELECT_CATALOGUE_ITEM;
		}
		
		get selectData(){
			return this.data;
		}
	}
}
