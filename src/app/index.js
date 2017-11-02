var fs = require("fs");
const path = require('path');
var iBACnet = require("../app/bacnet");
var bacnetutil = require("../app/bacnetutil")
var iFile = require("../app/file")
var config;
// fs.readFile("json/config.json", function (err, buff) {
//     var str = buff.toString()
//     var data = JSON.parse(str);
//     config = data;
//     console.log(data)
// })


//console.log(getFileTree("F:/"))