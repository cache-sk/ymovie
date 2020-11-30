class SccUtil {
	static normalizeResponse(data, title){
		const result = data.data.map(item => this.normalizeItem(item));
		const page = data?.pagination;
		if(page?.prev)
			result.unshift(CatalogueUtil.createSccLink("folder", title, page.prev, `${page.page - 1}/${page.pageCount}`, page.page - 1))
		if(page?.next)
			result.push(CatalogueUtil.createSccLink("folder", title, page.next, `${page.page + 1}/${page.pageCount}`, page.page + 1));
		return result;
	}
	
	static normalizeIdsResponse(data, ids, title){
		const normalized = this.normalizeResponse(data, title);
		const result = [];
		for(const id of ids){
			const item = normalized.find(item => item.id === id);
			if(item)
				result.push(item);
		}
			
		return result;
	}
	
	static mergeI18n(list){
		const result = {};
		list.forEach(item => {
			Object.keys(item).forEach(key => {
				if(!result[key])
					result[key] = item[key];
			})
		})
		return result;
	}
	
	static resolvePoster(list){
		const missing = /^https:\/\/img.csfd.cz\/assets\/b[0-9]+\/images\/poster-free\.png$/;
		for(const info of list){
			const url = info?.art?.poster;
			if(url && !url?.match(missing))
				return url;
		}
		return null;
	}
	
	static normalizeItem(item){
		const source = item._source;
		const info = source.info_labels;
		const info2 = source.info2 = this.mergeI18n(source.i18n_info_labels);
		const result = {id:item._id, poster:this.resolvePoster(source.i18n_info_labels)};
		if(info2.title) result.title = info2.title;
		if(info.year) result.year = info.year;
		if(info2.rating) result.rating = info2.rating;
		if(info.mediatype === "movie") this.normalizeMovie(source, result);
		if(info.mediatype === "tvshow") this.normalizeSeries(source, result);
		if(info.mediatype === "season") this.normalizeSeason(source, result);
		if(info.mediatype === "episode") this.normalizeEpisode(source, result);
		return result;
	}
	
	static normalizePlayable(source, result){
		const info = source.info_labels;
		const info2 = source.info2;
		const trailers = source.i18n_info_labels.map(item => item.trailer).filter(item => !!item);
		if(info2.plot) result.plot = info2.plot;
		if(trailers.length) result.trailers = trailers;
		if(info.mpaa) result.mpaa = info.mpaa;
		if(info.studio) result.studio = info.studio.constructor === Array ? info.studio.join(", ") : info.studio;
		if(source.services) result.services = source.services;
		if(source?.available_streams?.count) result.streamCount = source.available_streams.count;
		if(info.originaltitle) result.originalTitle = info.originaltitle;
		if(info.genre?.length) result.genres = info.genre.join(", ");
		if(info.director?.length) result.directors = info.director.join(", ");
		if(source.cast?.length) result.cast = source.cast.map(item => item.name).join(", ");
	}
	
	static normalizeMovie(source, result){
		result.type = CatalogueItemType.SCC_MOVIE;
		this.normalizePlayable(source, result);
	}
	
	static normalizeSeries(source, result){
		result.type = CatalogueItemType.SCC_SERIES;
	}
	
	static normalizeSeason(source, result){
		result.type = CatalogueItemType.SCC_SEASON;
		result.seriesTitle = this.normalizeRootTitle(source);
		result.seasonNumber = source.info_labels.season;
	}
	
	static normalizeEpisode(source, result){
		result.type = CatalogueItemType.SCC_EPISODE;
		this.normalizePlayable(source, result);
		result.seriesTitle = this.normalizeRootTitle(source);
		result.seasonNumber = source.info_labels.season;
		result.episodeNumber = source.info_labels.episode;
	}
	
	static normalizeRootTitle(source){
		return source.i18n_info_labels
				.find(item => item?.parent_titles?.[0])?.parent_titles?.[0]
			|| source?.root_info_labels?.originaltitle
			|| "(?) " + source?.root_parent;
	}
	
	static normalizeStreams(source){
		return source.map(item => this.normalizeStream(item));
	}
	
	static normalizeStream(source){
		const video = source.video[0];
		const result = {
			size: source.size,
			language: source.audio
				.map(item => item.language.toUpperCase() || "?")
				.filter((value, index, self) => self.indexOf(value) === index)
				.sort()
				.join("/"),
			subtitles: source.subtitles
				.map(item => item.language.toUpperCase() || "?")
				.filter((value, index, self) => self.indexOf(value) === index)
				.sort()
				.join("/"),
			width: video.width,
			height: video.height,
			videoCodec: source.video
				.map(item => item.codec)
				.filter((value, index, self) => self.indexOf(value) === index)
				.join("/"),
			audioCodec: source.audio
				.map(item => item.codec)
				.filter((value, index, self) => self.indexOf(value) === index)
				.join("/"),
			duration: video.duration,
			ident: source.ident
		};
		result.hdr = !!source.video.find(item => item.hdr);
		result['3d'] = !!source.video.find(item => item['3d']);
		return result;
	}
}
