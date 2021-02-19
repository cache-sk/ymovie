const fs = require("fs");
const path = require("path");

const ___dirname = path.resolve();
const dst = ___dirname + "/dist";

fs.mkdirSync(dst, {recursive:true});
