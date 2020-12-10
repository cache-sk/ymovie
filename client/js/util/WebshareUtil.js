class WebshareUtil {
	static getFirst(source, param){
		return source.getElementsByTagName(param)[0];
	}
	
	static getText(source, param){
		return this.getFirst(source, param)?.textContent;
	}
	
	static getInt(source, param){
		return parseInt(this.getText(source, param));
	}
	
	static isSearchQuery(query){
		return query.match(/[\s]+ws$/);
	}
	
	static normalizeSearchQuery(query){
		return query.replace(/[\s]+ws$/, "").trim();
	}
	
	static normalizeSearchResponse(data, query, title, page){
		const total = this.getInt(data, "total");
		const result = [...data.getElementsByTagName("file")]
			.map(this.normalizeItem.bind(this));
		const pageCount = Math.ceil(total / 100);
		if(page)
			result.unshift(CatalogueUtil.createTrigger("folder", title, `${page}/${pageCount}`, "search", {query, page:page - 1}));
		if(page + 1 < pageCount)
			result.push(CatalogueUtil.createTrigger("folder", title, `${page + 2}/${pageCount}`, "search", {query, page:page + 1}));
		return result;
	}
	
	static normalizeItemResponse(data, ident){
		const result = this.normalizeItem(data);
		result.id = ident;
		return result;
	}
	
	static normalizeItem(item){
		const ratingPositive = this.getInt(item, "positive_votes");
		const ratingNegative = this.getInt(item, "negative_votes");
		return {
			type: CatalogueItemType.WEBSHARE_VIDEO,
			id: this.getText(item, "ident"),
			poster: this.getText(item, "img"),
			title: this.getText(item, "name"),
			ratingPositive, ratingNegative,
			size: this.getInt(item, "size")
		}
	}
	
	static normalizeStreams(ident, data){
		const video = this.getFirst(data, "video");
		const audio = this.getFirst(data, "audio");
		return [{
			ident,
			size: this.getInt(data, "size"),
			duration: this.getInt(data, "length"),
			width: this.getInt(this.getFirst(video, "stream"), "width"),
			height: this.getInt(this.getFirst(video, "stream"), "height"),
			videoCodec: [...video.getElementsByTagName("stream")]
				.map(item => this.getText(item, "format"))
				.join("/"),
			audioCodec: [...audio.getElementsByTagName("stream")]
				.map(item => this.getText(item, "format"))
				.join("/"),
		}];
	}
	
	static containsExtension(url) {
		var chunks = url.split(".");
		var extension = chunks[chunks.length - 1];
		return extension.length < 5;
	}
}
