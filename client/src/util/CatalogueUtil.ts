namespace ymovie.util {
	export class CatalogueUtil {
		static createSccLink(group:type.Catalogue.ItemType, label:string, url:string, subtitle?:string, page?:number):type.Catalogue.SccLink {
			return new type.Catalogue.SccLink(group, label, url, subtitle, page);
		}
		
		static createCallback(group:type.Catalogue.ItemType, label:string, callback:(replace?:boolean) => void):type.Catalogue.Callback {
			return new type.Catalogue.Callback(group, label, callback);
		}
		
		static createTrigger(group:type.Catalogue.ItemType, label:string, subtitle:string, action:util.TriggerActionAny):type.Catalogue.Trigger {
			return new type.Catalogue.Trigger(group, label, subtitle, action);
		}
	}
}
