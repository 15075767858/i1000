var express = require('express');
var config = require('./config');
var iBacnet = require("./bacnet")
var app = express();

app.get('/', function (req, res) {
    res.send('Hello World');
})

app.get("/getWhoIsDevices", function (req, res) {
    iBacnet.getWhoIsData(req.query.whoisDelay*1000||3000, function (err,data) {
        res.send(data)
    })
})

var server = app.listen(config.getServerPort(), function () {
    var host = server.address().address
    
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
})