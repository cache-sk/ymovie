namespace ymovie.util {
	export class CatalogueUtil {
		static createSccLink(group:enums.ItemGroup, label:string, url:string, subtitle?:string, page?:number):type.Catalogue.SccLink {
			return new type.Catalogue.SccLink(group, label, url, subtitle, page);
		}
		
		static createCallback(group:enums.ItemGroup, label:string, callback:(replace?:boolean) => void):type.Catalogue.Callback {
			return new type.Catalogue.Callback(group, label, callback);
		}
		
		static createTrigger(group:enums.ItemGroup, label:string, subtitle:string, action:util.TriggerActionAny):type.Catalogue.Trigger {
			return new type.Catalogue.Trigger(group, label, subtitle, action);
		}
	}
}
