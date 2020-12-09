class WatchedUtil {
	static KEY_WATCHED_MOVIES = "KEY_WATCHED_MOVIES";
	static KEY_WATCHED_SERIES = "KEY_WATCHED_SERIES";
	static KEY_WATCHED_EPISODES = "KEY_WATCHED_EPISODES";
	static MAX_WATCHED_LENGTH = 100;
	
	static addMovie(id){
		this.add(this.KEY_WATCHED_MOVIES, id);
	}
	
	static get movies(){
		return this.get(this.KEY_WATCHED_MOVIES);
	}
	
	static addSeries(id){
		this.add(this.KEY_WATCHED_SERIES, id);
	}
	
	static get series(){
		return this.get(this.KEY_WATCHED_SERIES);
	}
	
	static addEpisode(id){
		this.add(this.KEY_WATCHED_EPISODES, id);
	}
	
	static get episodes(){
		return this.get(this.KEY_WATCHED_EPISODES);
	}
	
	static add(key, id){
		const max = this.MAX_WATCHED_LENGTH;
		MyStorage.set(key, Util.unshiftAndLimit(this.get(key), id, max).join(","));
	}
	
	static get(key){
		const data = MyStorage.get(key);
		return data ? data.split(",") : [];
	}
}
