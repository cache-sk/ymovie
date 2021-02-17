namespace ymovie.util {
	export class CatalogueUtil {
		static createSccLink(group:string, label:string, url:string, subtitle?:string, page?:number):type.Type.CatalogueItem {
			return {type:type.Type.CatalogueItemType.SCC_LINK, group, label, url, subtitle, page};
		}
		
		static createCallback(group:string, label:string, callback:(replace?:boolean) => void):type.Type.CatalogueItem {
			return {type:type.Type.CatalogueItemType.CALLBACK, group, label, callback};
		}
		
		static createTrigger(group:string, label:string, subtitle:string, action:enums.Action, payload:any):type.Type.CatalogueItem {
			return {type:type.Type.CatalogueItemType.TRIGGER, group, label, subtitle, action, payload};
		}
	}
}
