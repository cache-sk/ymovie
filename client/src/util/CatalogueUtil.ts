namespace ymovie.util {
	export class CatalogueUtil {
		static createSccLink(group:string, label:string, url:string, subtitle?:string, page?:number):type.Type.CatalogueItemSccLink {
			return new type.Type.CatalogueItemSccLink(group, label, url, subtitle, page);
		}
		
		static createCallback(group:string, label:string, callback:(replace?:boolean) => void):type.Type.CatalogueItemCallback {
			return new type.Type.CatalogueItemCallback(group, label, callback);
		}
		
		static createTrigger(group:string, label:string, subtitle:string, action:util.TriggerActionAny):type.Type.CatalogueItemTrigger {
			return new type.Type.CatalogueItemTrigger(group, label, subtitle, action);
		}
	}
}
