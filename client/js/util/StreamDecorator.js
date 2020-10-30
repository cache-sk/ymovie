/**
Stream
	size:Number = 123456
	language:String = "EN, CZ, SK"
	width:Number = 1920
	height:Number = 1080
	audioCodec:String = "EAC3"
	videoCodec:String = "h264"
	duration:Number = 7200 (in seconds)
	ident:String = "aEusE4" (webshare)
	*hdr:Bool = true
	*3d:Bool = true
 */

class StreamDecorator {
	static create(source){
		return new this(source);
	}
	
	constructor(source){
		this.source = source;
	}
	
	get language(){
		return this.source.language;
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
		return this.source['3d'] ? "3D" : null;
	}
	
	get formatDuration(){
		if(!this.source.duration)
			return null;
		const iso = new Date(this.source.duration  * 1000).toISOString().substr(11, 5);
		return iso[0] === "0" ? iso.substr(1) : iso;
	}
}
