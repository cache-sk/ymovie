module.exports = {
  apps : [{
    name        : "ymovie",
    script      : "./server/index.js",
    watch       : true,
    exec_mode   : 'fork',
    instances   : 1
  }]
}
