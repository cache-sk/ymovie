namespace ymovie.parser {
	export class Webshare {
		static searchResponseToCatalogue(data:Element, query:string, title:string, page:number):Array<type.Catalogue.AnyItem> {
			const total = this.getInt(data, "total");
			const result:Array<type.Catalogue.AnyItem> = this.getElementsByTagNameArray(data, "file")
				.map(item => this.normalizeItem(item));
			const pageCount = Math.ceil(total / 100);
			if(page)
				result.unshift(new type.Catalogue.Trigger("folder", title, `${page}/${pageCount}`, new type.Action.Search({query, page:page - 1})));
			if(page + 1 < pageCount)
				result.push(new type.Catalogue.Trigger("folder", title, `${page + 2}/${pageCount}`, new type.Action.Search({query, page:page + 1})));
			return result;
		}
		
		static fileInfoToItem(data:Element, ident:string):type.Media.Webshare {
			return this.normalizeItem(data, ident);
		}
		
		static fileInfoToStreams(ident:string, data:Element):Array<type.Media.Stream> {
			const video = this.getFirst(data, "video");
			const audio = this.getFirst(data, "audio");
			const stream:type.Media.Stream = {
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

		private static getFirst(source:Element | undefined, param:string):Element | undefined {
			return source && source.getElementsByTagName(param)?.[0];
		}
		
		private static getText(source:Element, param:string):string | undefined {
			return this.getFirst(source, param)?.textContent || undefined;
		}
		
		private static getInt(source:Element | undefined, param:string):number {
			return parseInt((source && this.getText(source, param)) || "");
		}
		
		// ES5 complains Type 'HTMLCollectionOf<Element>' is not an array type.
		private static getElementsByTagNameArray(data:Element | undefined, qualifiedName:string):Array<Element> {
			if(!data)
				return [];
			const list = data.getElementsByTagName(qualifiedName);
			const result:Array<Element> = [];
			for(let i = 0; i < list.length; i++)
				result.push(<Element>list[i]);
			return result;
		}

		private static normalizeItem(item:Element, id?:string):type.Media.Webshare {
			const result = new type.Media.Webshare(id || <string>this.getText(item, "ident"));
			result.poster = this.getText(item, "img");
			result.title = result.longTitle = this.getText(item, "name");
			const ratingPositive = this.getInt(item, "positive_votes");
			const ratingNegative = this.getInt(item, "negative_votes");
			if(ratingPositive || ratingNegative)
				result.rating = `${ratingPositive || 0}:${ratingNegative || 0}`;
			result.size = this.getInt(item, "size");
			return result;
		}
	}
}
