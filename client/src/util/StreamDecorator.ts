namespace ymovie.util {
	export class StreamDecorator {
		readonly source:type.Type.Stream;

		static create(source:type.Type.Stream){
			return new this(source);
		}
		
		constructor(source:type.Type.Stream){
			this.source = source;
		}
		
		get language(){
			return this.source.language;
		}
		
		get subtitles(){
			return this.source.subtitles;
		}
		
		get width(){
			return this.source.width;
		}
		
		get height(){
			return this.source.height;
		}
		
		get audioCodec(){
			return this.source.audioCodec;
		}
		
		get videoCodec(){
			return this.source.videoCodec;
		}
		
		get formatSize(){
			const mb = this.source.size / 1024 / 1024;
			return mb > 100 ? (mb / 1024).toFixed(1) + "G" : mb.toFixed(1) + "M";
		}
		
		get formatHDR(){
			return this.source.hdr ? "HDR" : null;
		}
		
		get format3D(){
			return this.source.is3d ? "3D" : null;
		}
		
		get formatDuration(){
			if(!this.source.duration)
				return null;
			const iso = new Date(this.source.duration  * 1000).toISOString().substr(11, 5);
			return iso[0] === "0" ? iso.substr(1) : iso;
		}
	}
}
