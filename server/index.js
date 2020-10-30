const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8080;
const http = require('http');
const CacheHandler = require("./CacheHandler.js");
const StaticHandler = require("./StaticHandler.js");
const ProxyHandler = require("./ProxyHandler.js");

const cacheHandler = new CacheHandler();
const staticHandler = new StaticHandler();
const proxyHandler = new ProxyHandler();
const debug = process.argv.indexOf("debug") > -1;

if(!debug)
	cacheHandler.init();

const onRequest = (request, response) => {
	if(cacheHandler.handle(request, response))
		return;
	if(proxyHandler.handle(request, response))
		return;
	cacheHandler.handle404(request, response);
}

http.createServer(onRequest).listen(port, host, () => {
	console.log(`Server running at http://${host}:${port}/`);
});
