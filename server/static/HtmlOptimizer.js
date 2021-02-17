const fs = require('fs');
const path = require("path");
const csso = require('csso');
const minify = require("@babel/core").transformSync;
const Util = require("./Util.js");

module.exports = class HtmlOptimizer {
	constructor(base){
		this.base = base;
	}
	
	optimize(source){
		let result = source.toString('utf8');
		result = this.inlineScrips(result);
		result = this.mergeScripts(result);
		result = this.minifyScripts(result);
		result = this.inlineStyles(result);
		result = this.mergeStyles(result);
		result = this.minifyStyles(result);
		result = this.replaceVariables(result);
		return result;
	}
	
	getContent(file){
		if(file[0] !== "/")
			return null;
		const filePath = path.join(this.base, file);
		if(!Util.isFile(filePath))
			return null;
		return fs.readFileSync(filePath, {encoding:'utf8'});
	}
	
	inlineScrips(source){
		return source.replace(/<script src=\"(.*?)\"><\/script>/g, this.inlineScriptsReplacer.bind(this));
	}
	
	inlineScriptsReplacer(matched, file){
		const content = this.getContent(file);
		return content ? `<script>\n${content}\n</script>` : matched;
	}
	
	inlineStyles(content){
		return content.replace(/<link rel=\"stylesheet\" href="(.*?)">/g, this.inlineStylesReplacer.bind(this));
	}
	
	inlineStylesReplacer(matched, file){
		const content = this.getContent(file);
		return content ? `<style>\n${content}\n</style>` : matched;
	}
	
	mergeScripts(source){
		return source.replace(/\s*<\/script>\s*<script>\s*/g, "\n");
	}
	
	mergeStyles(source){
		return source.replace(/\s*<\/style>\s*<style>\s*/g, "\n");
	}
	
	minifyScripts(source){
		// https://babeljs.io/docs/en/babel-preset-minify#options
		return source.replace(/<script>(.*?)<\/script>/gs, (matched, content) => {
			const {code} = minify(content, {
				plugins: ["transform-class-properties"],
				comments: false,
				presets: [["minify", {mangle:true, keepFnName:false, keepClassName:true}]]
			});
			return `<script>${code}</script>`;
		});
	}
	
	minifyStyles(source){
		// https://www.npmjs.com/package/csso
		return source.replace(/<style>(.*?)<\/style>/gs, (matched, content) => {
			const result = csso.minify(content).css;
			return `<style>${result}</style>`;
		});
	}
	
	replaceVariables(source){
		let result = source;
		if(source.indexOf("${COMMIT_DATE}") > -1)
			result = result.replace("${COMMIT_DATE}", Util.getCommitDate());
		return result;
	}
}
