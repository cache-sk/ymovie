class ApiWebshare {
	static ENDPOINT = "https://webshare.cz";
	static PATH_SALT = "/api/salt/";
	static PATH_LOGIN = "/api/login/";
	static PATH_USER_DATA = "/api/user_data/";
	static PATH_FILE_LINK = "/api/file_link/";
	static PATH_SEARCH = "/api/search/";
	static PATH_FILE_INFO = "/api/file_info/";

	constructor(uuid){
		this.uuid = uuid;
	}

	async getToken(username, password){
		const salt = await this.getSalt(username);
		return await this.getLogin(username, password, salt);
	}
	
	async load(path, body){
		const url = `${this.constructor.ENDPOINT}${path}`
		const headers = {'Content-Type': 'application/x-www-form-urlencoded'};
		const response = await (await fetch(url, {method:"POST", body, headers})).text();
		const xml = new DOMParser().parseFromString(response, "application/xml");
		try {
			const response = xml.getElementsByTagName("response")[0];
			if(response.getElementsByTagName("status")[0].textContent !== "OK")
				throw new Error(response.getElementsByTagName("message")[0].textContent);
			return response;
		} catch (error) {
			throw error;
		}
		throw new Error("Unknown error");
	}
	
	async loadValue(path, body, param){
		const xml = await this.load(path, body);
		return xml.getElementsByTagName(param)[0].textContent;
	}
	
	async getSalt(username){
		const body = `username_or_email=${encodeURIComponent(username)}`;
		return await this.loadValue(this.constructor.PATH_SALT, body, "salt");
	}
	
	async getLogin(username, password, salt){
		const hash = this.constructor.hashPassword(password, salt);
		const body = `username_or_email=${encodeURIComponent(username)}&keep_logged_in=1&password=${hash}`;
		return await this.loadValue(this.constructor.PATH_LOGIN, body, "token");
	}
	
	async getUsername(token){
		const body = `wst=${encodeURIComponent(token)}`;
		return await this.loadValue(this.constructor.PATH_USER_DATA, body, "username");
	}
	
	async getLink(ident, token){
		const body = `ident=${encodeURIComponent(ident)}&wst=${encodeURIComponent(token)}&device_uuid=${encodeURIComponent(this.uuid)}`;
		return await this.loadValue(this.constructor.PATH_FILE_LINK, body, "link");
	}
	
	async search(what, page){
		const body = `what=${encodeURIComponent(what)}&sort=recent&limit=100&offset=${page * 100}&category=video`;
		return await this.load(this.constructor.PATH_SEARCH, body);
	}
	
	async fileInfo(ident){
		const body = `ident=${encodeURIComponent(ident)}`;
		return await this.load(this.constructor.PATH_FILE_INFO, body);
	}
}

((t)=>{

// https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/core.min.js
!function(t,n){"object"==typeof exports?module.exports=exports=n():"function"==typeof define&&define.amd?define([],n):t.CryptoJS=n()}(this,function(){var t=t||function(f){var t;if("undefined"!=typeof window&&window.crypto&&(t=window.crypto),!t&&"undefined"!=typeof window&&window.msCrypto&&(t=window.msCrypto),!t&&"undefined"!=typeof global&&global.crypto&&(t=global.crypto),!t&&"function"==typeof require)try{t=require("crypto")}catch(t){}function i(){if(t){if("function"==typeof t.getRandomValues)try{return t.getRandomValues(new Uint32Array(1))[0]}catch(t){}if("function"==typeof t.randomBytes)try{return t.randomBytes(4).readInt32LE()}catch(t){}}throw new Error("Native crypto module could not be used to get secure random number.")}var e=Object.create||function(t){var n;return r.prototype=t,n=new r,r.prototype=null,n};function r(){}var n={},o=n.lib={},s=o.Base={extend:function(t){var n=e(this);return t&&n.mixIn(t),n.hasOwnProperty("init")&&this.init!==n.init||(n.init=function(){n.$super.init.apply(this,arguments)}),(n.init.prototype=n).$super=this,n},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var n in t)t.hasOwnProperty(n)&&(this[n]=t[n]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}},p=o.WordArray=s.extend({init:function(t,n){t=this.words=t||[],this.sigBytes=null!=n?n:4*t.length},toString:function(t){return(t||c).stringify(this)},concat:function(t){var n=this.words,e=t.words,i=this.sigBytes,r=t.sigBytes;if(this.clamp(),i%4)for(var o=0;o<r;o++){var s=e[o>>>2]>>>24-o%4*8&255;n[i+o>>>2]|=s<<24-(i+o)%4*8}else for(o=0;o<r;o+=4)n[i+o>>>2]=e[o>>>2];return this.sigBytes+=r,this},clamp:function(){var t=this.words,n=this.sigBytes;t[n>>>2]&=4294967295<<32-n%4*8,t.length=f.ceil(n/4)},clone:function(){var t=s.clone.call(this);return t.words=this.words.slice(0),t},random:function(t){for(var n=[],e=0;e<t;e+=4)n.push(i());return new p.init(n,t)}}),a=n.enc={},c=a.Hex={stringify:function(t){for(var n=t.words,e=t.sigBytes,i=[],r=0;r<e;r++){var o=n[r>>>2]>>>24-r%4*8&255;i.push((o>>>4).toString(16)),i.push((15&o).toString(16))}return i.join("")},parse:function(t){for(var n=t.length,e=[],i=0;i<n;i+=2)e[i>>>3]|=parseInt(t.substr(i,2),16)<<24-i%8*4;return new p.init(e,n/2)}},u=a.Latin1={stringify:function(t){for(var n=t.words,e=t.sigBytes,i=[],r=0;r<e;r++){var o=n[r>>>2]>>>24-r%4*8&255;i.push(String.fromCharCode(o))}return i.join("")},parse:function(t){for(var n=t.length,e=[],i=0;i<n;i++)e[i>>>2]|=(255&t.charCodeAt(i))<<24-i%4*8;return new p.init(e,n)}},d=a.Utf8={stringify:function(t){try{return decodeURIComponent(escape(u.stringify(t)))}catch(t){throw new Error("Malformed UTF-8 data")}},parse:function(t){return u.parse(unescape(encodeURIComponent(t)))}},h=o.BufferedBlockAlgorithm=s.extend({reset:function(){this._data=new p.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=d.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(t){var n,e=this._data,i=e.words,r=e.sigBytes,o=this.blockSize,s=r/(4*o),a=(s=t?f.ceil(s):f.max((0|s)-this._minBufferSize,0))*o,c=f.min(4*a,r);if(a){for(var u=0;u<a;u+=o)this._doProcessBlock(i,u);n=i.splice(0,a),e.sigBytes-=c}return new p.init(n,c)},clone:function(){var t=s.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0}),l=(o.Hasher=h.extend({cfg:s.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){h.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){return t&&this._append(t),this._doFinalize()},blockSize:16,_createHelper:function(e){return function(t,n){return new e.init(n).finalize(t)}},_createHmacHelper:function(e){return function(t,n){return new l.HMAC.init(e,n).finalize(t)}}}),n.algo={});return n}(Math);return t});

// https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/sha1.min.js
!function(e,t){"object"==typeof exports?module.exports=exports=t(require("./core")):"function"==typeof define&&define.amd?define(["./core"],t):t(e.CryptoJS)}(this,function(e){var t,r,o,s,n,l,i;return r=(t=e).lib,o=r.WordArray,s=r.Hasher,n=t.algo,l=[],i=n.SHA1=s.extend({_doReset:function(){this._hash=new o.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(e,t){for(var r=this._hash.words,o=r[0],s=r[1],n=r[2],i=r[3],a=r[4],h=0;h<80;h++){if(h<16)l[h]=0|e[t+h];else{var c=l[h-3]^l[h-8]^l[h-14]^l[h-16];l[h]=c<<1|c>>>31}var f=(o<<5|o>>>27)+a+l[h];f+=h<20?1518500249+(s&n|~s&i):h<40?1859775393+(s^n^i):h<60?(s&n|s&i|n&i)-1894007588:(s^n^i)-899497514,a=i,i=n,n=s<<30|s>>>2,s=o,o=f}r[0]=r[0]+o|0,r[1]=r[1]+s|0,r[2]=r[2]+n|0,r[3]=r[3]+i|0,r[4]=r[4]+a|0},_doFinalize:function(){var e=this._data,t=e.words,r=8*this._nDataBytes,o=8*e.sigBytes;return t[o>>>5]|=128<<24-o%32,t[14+(64+o>>>9<<4)]=Math.floor(r/4294967296),t[15+(64+o>>>9<<4)]=r,e.sigBytes=4*t.length,this._process(),this._hash},clone:function(){var e=s.clone.call(this);return e._hash=this._hash.clone(),e}}),t.SHA1=s._createHelper(i),t.HmacSHA1=s._createHmacHelper(i),e.SHA1});

// https://webshare.cz/includes.php
var chrsz = 8; 
var ascii64 = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function md5crypt(password, salt) {
	var ctx = password + "$1$" + salt;
	var ctx1 = str_md5(password + salt + password);

	/* "Just as many characters of ctx1" (as there are in the password) */
	for (var pl = password.length; pl > 0; pl -= 16)
	ctx += ctx1.slice(0, (pl > 16) ? 16 : pl);

	/* "Then something really weird" */
	for (var i = password.length; i != 0; i >>= 1)
	if (i & 1) ctx += "\0";
	else ctx += password.charAt(0);

	ctx = str_md5(ctx);

	/* "Just to make sure things don't run too fast" */
	for (i = 0; i < 1000; i++) {
		ctx1 = "";
		if (i & 1) ctx1 += password;
		else ctx1 += ctx;

		if (i % 3) ctx1 += salt;

		if (i % 7) ctx1 += password;

		if (i & 1) ctx1 += ctx;
		else ctx1 += password;

		ctx = str_md5(ctx1);
	}

	return "$1$" + salt + "$" + to64_triplet(ctx, 0, 6, 12) + to64_triplet(ctx, 1, 7, 13) + to64_triplet(ctx, 2, 8, 14) + to64_triplet(ctx, 3, 9, 15) + to64_triplet(ctx, 4, 10, 5) + to64_single(ctx, 11);
}


function str_md5(s) {
	return binl2str(core_md5(str2binl(s), s.length * chrsz));
}

function binl2str(bin) {
	var str = "";
	var mask = (1 << chrsz) - 1;
	for (var i = 0; i < bin.length * 32; i += chrsz)
	str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & mask);
	return str;
}

function str2binl(str) {
	var bin = Array();
	var mask = (1 << chrsz) - 1;
	for (var i = 0; i < str.length * chrsz; i += chrsz)
	bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
	return bin;
}

function core_md5(x, len) {
	/* append padding */
	x[len >> 5] |= 0x80 << ((len) % 32);
	x[(((len + 64) >>> 9) << 4) + 14] = len;

	var a = 1732584193;
	var b = -271733879;
	var c = -1732584194;
	var d = 271733878;

	for (var i = 0; i < x.length; i += 16) {
		var olda = a;
		var oldb = b;
		var oldc = c;
		var oldd = d;

		a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
		d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
		c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
		b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
		a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
		d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
		c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
		b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
		a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
		d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
		c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
		b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
		a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
		d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
		c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
		b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

		a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
		d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
		c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
		b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
		a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
		d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
		c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
		b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
		a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
		d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
		c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
		b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
		a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
		d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
		c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
		b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

		a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
		d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
		c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
		b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
		a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
		d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
		c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
		b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
		a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
		d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
		c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
		b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
		a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
		d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
		c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
		b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

		a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
		d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
		c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
		b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
		a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
		d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
		c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
		b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
		a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
		d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
		c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
		b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
		a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
		d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
		c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
		b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

		a = safe_add(a, olda);
		b = safe_add(b, oldb);
		c = safe_add(c, oldc);
		d = safe_add(d, oldd);
	}
	return Array(a, b, c, d);
}

function md5_cmn(q, a, b, x, s, t) {
	return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
}

function md5_ff(a, b, c, d, x, s, t) {
	return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}

function md5_gg(a, b, c, d, x, s, t) {
	return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}

function md5_hh(a, b, c, d, x, s, t) {
	return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}

function md5_ii(a, b, c, d, x, s, t) {
	return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

function safe_add(x, y) {
	var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	return (msw << 16) | (lsw & 0xFFFF);
}

function bit_rol(num, cnt) {
	return (num << cnt) | (num >>> (32 - cnt));
}

function to64_triplet(str, idx0, idx1, idx2) {
	var v = (str.charCodeAt(idx0) << 16) | (str.charCodeAt(idx1) << 8) | (str.charCodeAt(idx2));
	return to64(v, 4);
}

function to64(v, n) {
	var s = "";
	while (--n >= 0) {
		s += ascii64.charAt(v & 0x3f);
		v >>= 6;
	}
	return s;
}

function to64_single(str, idx0) {
	var v = str.charCodeAt(idx0);
	return to64(v, 2);
}

t.hashPassword = function(password, salt){
	return CryptoJS.SHA1(md5crypt(password, salt)).toString();
}

})(ApiWebshare)
