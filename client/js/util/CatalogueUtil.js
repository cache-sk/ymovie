class CatalogueUtil {
	static createSccLink(group, label, url, subtitle, page){
		return {type:CatalogueItemType.SCC_LINK, group, label, url, subtitle, page};
	}
	
	static createCallback(group, label, callback){
		return {type:CatalogueItemType.CALLBACK, group, label, callback};
	}
	
	static createTrigger(group, label, subtitle, action, payload){
		return {type:CatalogueItemType.TRIGGER, group, label, subtitle, action, payload};
	}
}
