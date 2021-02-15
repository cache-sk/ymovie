const fs = require('fs');
const execSync = require('child_process').execSync;

module.exports = class Util {
	static isFile(path){
		try {
			return fs.lstatSync(path).isFile();
		} catch (e) {
			return false;
		}
	}
	
	static getCommitDate(){
		try {
			const stdio = ['pipe', 'pipe', 'pipe'];
			return execSync('git log -1 --format=%ct', {encoding:'utf8', stdio:stdio}).trim() * 1000;
		} catch (e) {
			return new Date().getTime();
		}
	}
}
