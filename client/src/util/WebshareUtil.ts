namespace ymovie.util {
	export class WebshareUtil {
		static getFirst(source:Element | undefined, param:string):Element | undefined {
			return source && source.getElementsByTagName(param)?.[0];
		}
		
		static getText(source:Element, param:string):string | undefined {
			return this.getFirst(source, param)?.textContent || undefined;
		}
		
		static getInt(source:Element | undefined, param:string):number {
			return parseInt((source && this.getText(source, param)) || "");
		}
		
		static isSearchQuery(query:string):boolean {
			return query.match(/[\s]+ws$/) ? true : false;
		}
		
		static normalizeSearchQuery(query:string):string {
			return query.replace(/[\s]+ws$/, "").trim();
		}
		
		// ES5 complains Type 'HTMLCollectionOf<Element>' is not an array type.
		static getElementsByTagNameArray(data:Element | undefined, qualifiedName:string):Array<Element> {
			if(!data)
				return [];
			const list = data.getElementsByTagName(qualifiedName);
			const result:Array<Element> = [];
			for(let i = 0; i < list.length; i++)
				result.push(<Element>list[i]);
			return result;
		}

		static normalizeSearchResponse(data:Element, query:string, title:string, page:number):Array<type.Type.AnyCatalogueItem> {
			const total = this.getInt(data, "total");
			const result:Array<type.Type.AnyCatalogueItem> = this.getElementsByTagNameArray(data, "file")
				.map(this.normalizeItem.bind(this));
			const pageCount = Math.ceil(total / 100);
			if(page)
				result.unshift(CatalogueUtil.createTrigger("folder", title, `${page}/${pageCount}`, new type.Action.Search({query, page:page - 1})));
			if(page + 1 < pageCount)
				result.push(CatalogueUtil.createTrigger("folder", title, `${page + 2}/${pageCount}`, new type.Action.Search({query, page:page + 1})));
			return result;
		}
		
		static normalizeItemResponse(data:Element, ident:string):type.Type.WebshareItem {
			const result = this.normalizeItem(data);
			result.id = ident;
			return result;
		}
		
		static normalizeItem(item:Element):type.Type.WebshareItem {
			const ratingPositive = this.getInt(item, "positive_votes");
			const ratingNegative = this.getInt(item, "negative_votes");
			return {
				type: ymovie.type.Type.CatalogueItemType.WEBSHARE_VIDEO,
				id: <string>this.getText(item, "ident"),
				poster: <string>this.getText(item, "img"),
				title: <string>this.getText(item, "name"),
				ratingPositive, ratingNegative,
				size: this.getInt(item, "size")
			}
		}
		
		static normalizeStreams(ident:string, data:Element):Array<type.Type.Stream> {
			const video = this.getFirst(data, "video");
			const audio = this.getFirst(data, "audio");
			const stream:type.Type.Stream = {
				ident,
				size: this.getInt(data, "size"),
				duration: this.getInt(data, "length"),
				width: this.getInt(this.getFirst(video, "stream"), "width"),
				height: this.getInt(this.getFirst(video, "stream"), "height"),
				videoCodec: this.getElementsByTagNameArray(video, "stream")
					.map(item => this.getText(item, "format"))
					.join("/"),
				audioCodec: this.getElementsByTagNameArray(audio, "stream")
					.map(item => this.getText(item, "format"))
					.join("/"),
			}
			return [stream];
		}
		
		static containsExtension(url:string):boolean {
			var chunks = url.split(".");
			var extension = chunks[chunks.length - 1];
			return extension ? extension.length < 5 : false;
		}
	}
}
