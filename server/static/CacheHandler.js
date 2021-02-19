const fs = require('fs');
const path = require("path");
const zlib = require('zlib');
const HtmlOptimizer = require("./HtmlOptimizer.js");
const StaticHandler = require("./StaticHandler.js");
const Util = require("./Util.js");

module.exports = class CacheHandler extends StaticHandler {
	constructor(){
		super();
		this.files = ["404.html", "hbbtv.html", "index.html", "kodi.html", "play.html"];
		this.cache = {};
		this.htmlOptimizer = new HtmlOptimizer(this.base);
	}
	
	init(){
		console.log("Building cache:");
		for(const file of this.files)
			if(Util.isFile(path.join(this.base, file)))
				this.cacheFile(file);
	}
	
	cacheFile(file){
		const filePath = path.join(this.base, file);
		const content = this.handleFile(filePath);
		const data = {
			raw: content,
			deflate: zlib.deflateSync(content),
			gzip: zlib.gzipSync(content),
			br: zlib.brotliCompressSync(content)};
		this.cache[filePath] = data;
		console.log(`  ${file} raw:${data.raw.length} deflate:${data.deflate.length} gzip:${data.gzip.length} br:${data.br.length}`)
	}
	
	handlePath(request, response, path){
		const data = this.cache[path];
		if(data)
			return this.serveCachedContent(request, response, path, data)
		return super.handlePath(request, response, path);
	}
	
	serveCachedContent(request, response, path, data){
		const acceptEncoding = request.headers['accept-encoding'];
		if(/\bbr\b/.test(acceptEncoding))
			return this.write(path, response, data.br, 'br');
		if(/\bdeflate\b/.test(acceptEncoding))
			return this.write(path, response, data.deflate, 'deflate');
		if(/\bgzip\b/.test(acceptEncoding))
			return this.write(path, response, data.gzip, 'gzip');
		return this.write(path, response, data.raw);
	}
	
	write(path, response, content, contentEncoding){
		const contentType = this.getContentType(path);
		const headers = this.getDefaultHeaders(contentType);
		if(contentEncoding)
			headers['Content-Encoding'] = contentEncoding;
		response.writeHead(this.getStatusCode(path), headers);
		response.end(content);
		return true;
	}
	
	handleFile(file){
		const content = fs.readFileSync(file);
		const extname = path.extname(file);
		if(extname === ".html")
			return this.htmlOptimizer.optimize(content);
		return content;
	}
}
