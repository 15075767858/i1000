var fs = require("fs");
var iBACnet = require("../app/bacnet");
var bacnetutil = require("../app/bacnetutil")

var config;
fs.readFile("json/config.json", function (err, buff) {
    var str = buff.toString()
    var data = JSON.parse(str);
    config = data;
    console.log(data)
})
