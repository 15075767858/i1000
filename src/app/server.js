var express = require('express');
var path = require("path")
var config = require('./config');
var iBacnet = require("./bacnet");
var xml2js = require("xml2js");
var moment = require("moment");
var app = express();
var session = require('express-session')
var programResourcesPath = "F:/i1000/src/program/resources/";

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
var redis = require("redis");
var RedisDevice = require("./redis-device").RedisDevice;
var fs = require("fs");
var host;
var port;

var server = app.listen(80, function () {
    host = server.address().address
    port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)
})
app.get('/', function (req, res) {
    res.send('Hello World');
})
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))
app.get('/program/resources/main.php', function (req, res) {
    var ip = "127.0.0.1";

    console.log(host, port)
    var par = req.query.par;
    if (par == "getDeviceTree") {
        var redisDevice = new RedisDevice;
        redisDevice.ip = ip;
        redisDevice.getDeviceTree(function (err, root) {
            res.send(root);
            redisDevice.quit();
        })
    }
    if (par == "getDevList") {
        var redisDevice = new RedisDevice;
        redisDevice.getDevList(function (err, list) {
            res.send(list);
            redisDevice.quit();
        })
    }
    if (par == "getLoginInfo") {
        res.send(JSON.stringify(req.session))
    }
})

app.get('/program/resources/test1.php', function (req, res) {
    //res.send('Hello World!!!');
    var ip = "127.0.0.1";
    var par = req.param("par");

    if (par == "getDevsAll") {
        var redisDevice = new RedisDevice;
        redisDevice.getDevicesAll(null, function (devices) {
            res.send(devices);
            redisDevice.quit();
        })
    }
    if (par == "devXmlInit") {
        var redisDevice = new RedisDevice;
        redisDevice.getDevicesAll(null, function (devices) {
            redisDevice.quit();
            console.log(arguments)
            devices.forEach(device => {
                var xmlPath = path.format({
                    root: programResourcesPath,
                    name: "devxml/" + device,
                    ext: ".xml"
                })
                console.log(xmlPath)
                deviceXmlInit(xmlPath)
                res.send("");
            })
        })
    }
    if (par == "moveXml") {
        //req.param("filename")
    }
    if (par == "getKeyAll") {
        var key = req.param("key");
        var redisDevice = new RedisDevice;
        redisDevice.getAllKeysJson(function (err, obj) {
            res.send(obj[key]);
        })

    }
    if (par == "deleteKey") {
        var key = req.param("key");
        var client = redis.createClient();
        client.del(key, function (err, row) {
            res.send({
                success: true,
                info: row
            });
            client.quit();
        })
    }
    if (par == "repalceDeviceInstance") {
        var oldDev = req.param("oldDev");
        var newDev = req.param("newDev");
        var client = redis.createClient();
        client.keys(oldDev + "???", function (err, keys) {
            var count = 0;
            keys.forEach(key => {
                client.rename(key, newDev + key.substr(4, 3), function () {
                    count++;
                    if (count == keys.length) {
                        client.quit()
                        res.send({
                            success: true,
                            info: keys.length
                        })
                    }
                });
            })
        })
    }
    if (par == "filePublish") {
        var key = req.param("key");
        var value = req.param("value");
        var client = redis.createClient();
        client.hget('Send_File', "Present_Value", function (err, pv) {
            if (pv == "1") {
                client.publish(key, value, function () {
                    client.quit();
                });
                res.send(pv);
            } else {
                res.send(pv);
                client.quit();
            }
        })
    }
    if (par == "devPublish") {
        var key = req.param("key");
        var value = req.param("value");
        var client = redis.createClient();
        client.publish(key, value, () => {
            client.quit();
        });
    }
    if (par == "delFile") {
        var fn = filePathTransform(req.param("fileName"));
        fs.writeFileSync(fn, "");
        res.send("");
    }
    if (par == "getvalue") {
        var client = redis.createClient();
        var nodename = req.param("nodename");
        var type = req.param("type");
        client.hget(nodename, type, function (err, value) {
            res.send(value);
        })
    }
    if (par == "copyFile") {
        var sourcesFile = filePathTransform(req.param("sources"));
        var targetFile = filePathTransform(req.param("target"));
        res.send(fs.copyFileSync(sourcesFile, targetFile));

    }
    if (par == "save") {
        var client = redis.createClient();
        client.save();
        client.BGSAVE();
        client.lastSave();
        client.quit();
        res.send("");
    }
    if (par == "getKeys") {
        var client = redis.createClient();
        var devname = req.param("devname");
        var redisDevice = new RedisDevice;

        client.keys(devname + "*", function (err, keys) {
            keys.sort();
            var arr = [];
            redisDevice.getAllKeysJson(function (err, obj) {
                keys.forEach(key => {
                    obj[key]["key"] = key;
                    arr.push(obj[key]);
                })
                res.send(arr);
                client.quit();
            })
        })
    }
    if (par == "file_exists") {
        var fn = filePathTransform(req.param("filename"));
        res.send(fs.existsSync(fn));
    }
    if (par == "getAlarm") {
        var client = redis.createClient();
        var nodeName = req.param("nodename");
        client.hget(nodeName, "Alarm", function (err, value) {
            res.send(value);
            client.quit();
        })
    }
    if (par == "addAlarm") {
        var nodeName = req.param("nodename");
        setRedisUpdateTime(nodeName);
        var delay_time = req.param("delay_time");
        var notification_class = req.param("notification_class");
        var limit = req.param("limit") ? "\"limit\":" + req.param("limit") + "," : "";
        var event_enable = req.param("event_enable");
        var high_limit = req.param("high_limit") ? "\"high_limit\":" + req.param("high_limit") + "," : "";
        var low_limit = req.param("low_limit") ? "\"low_limit\":" + req.param("low_limit") + "," : "";
        var deadband = req.param("deadband") ? "\"deadband\":" + req.param("deadband") + "," : "";
        var event_type = req.param("event_type") ? "\"event_type\":" + req.param("event_type") + "," : "";
        var alarm_value = req.param("alarm_value") ? "\"alarm_value\":" + req.param("alarm_value") + "," : "";
        var type = "Alarm";
        var value = "{\"Set_Alarm\":[{" +
            +high_limit + low_limit + deadband +
            "\"delay_time\":" + delay_time + "," +
            "\"notification_class\":" + notification_class + ","
            + event_type + alarm_value + limit +
            "\"event_enable\":" + event_enable + "}]}";
        var client = redis.createClient();
        client.hset(key, type, value, function () {
            client.quit();
            res.send(value);
        });
    }
    if (par == "getAllScheduleNamesOuter") {
        var devname = req.param("devname");
        var schduleType = ["601", "602", "603", "604", "605", "606", "607", "608", "609", "610"];
        var newArray = [];
        var client = redis.createClient()
        client.keys("???????", function (err, keys) {
            keys.forEach(key => {
                if (schduleType.indexOf(key.substr(4, 3)) >= 0 & key.substr(0, 4) != devname) {
                    console.log(key)
                    newArray.push(key);
                }
            })
            client.quit();
            res.send(newArray);
        })
    }
    if (par == "ScheduleConfig") {
        //55FF053F00001FF3010C0002067F000001BAB900059C0F0C0040000119553E44C24400003F490ABA10
        var nodeName = req.param("nodename");
        setRedisUpdateTime(nodeName);
        var client = redis.createClient();
        var redisDevice = new RedisDevice;
        redisDevice.getAllKeysJson(function (err, obj) {
            setTimeout(function () {
                redisDevice.quit();
            }, 3000)
            var Object_Name = req.param("Object_Name");
            if (obj[nodeName]['Object_Name'] != Object_Name) {
                redisDevice.hset(nodename, "Object_Name", Object_Name);
                if (req.param("ispublish")) {
                    redisDevice.publish(nodeName.substr(0, 4) + ".8.*", nodeName + "\r\n" + "Object_Name" + "\r\n" + Object_Name);
                }
            }
            var Present_Value = req.param("Present_Value");
            if (obj[nodeName]['Present_Value'] != Present_Value) {
                redisDevice.hset(nodename, "Present_Value", Present_Value);
                if (req.param("ispublish")) {
                    redisDevice.publish(nodeName.substr(0, 4) + ".8.*", nodeName + "\r\n" + "Present_Value" + "\r\n" + Present_Value);
                }
            }
            var Description = req.param("Description");
            if (obj[nodeName]['Description'] != Description) {
                redisDevice.hset(nodename, "Description", Description);
                if (req.param("ispublish")) {
                    redisDevice.publish(nodeName.substr(0, 4) + ".8.*", nodeName + "\r\n" + "Description" + "\r\n" + Description);
                }
            }
            var Priority_For_Writing = req.param("Priority_For_Writing");
            if (obj[nodeName]['Priority_For_Writing'] != Priority_For_Writing) {
                redisDevice.hset(nodename, "Priority_For_Writing", Priority_For_Writing);
                if (req.param("ispublish")) {
                    redisDevice.publish(nodeName.substr(0, 4) + ".8.*", nodeName + "\r\n" + "Priority_For_Writing" + "\r\n" + Priority_For_Writing);
                }
            }
            if (req.param("after")) {
                var after = req.param("after");
                var value = trimall('{"dateRange":	{"startDate":{' + dateToJson(after) + '},"endDate":{"year":255,"month":255,"day_of_month":255,"day_of_week":255}}}');
                res.send(value);
                if (obj[nodeName]["Effective_Period"] != value) {
                    redisDevice.hset(nodename, "Effective_Period", value);
                    if (req.param("ispublish")) {
                        redisDevice.publish(nodeName.substr(0, 4) + ".8.*", nodeName + "\r\n" + "Effective_Period" + "\r\n" + value);
                    }
                }
            }
            if (req.param("front")) {
                var front = req.param("front");
                var value = trimall('{"dateRange":	{"startDate":{"year":255,"month":255,"day_of_month":255,"day_of_week":255},"endDate":{' + dateToJson(front) + '}}}');
                res.send(value);
                if (obj[nodeName]["Effective_Period"] != value) {
                    redisDevice.hset(nodename, "Effective_Period", value);
                    if (req.param("ispublish")) {
                        redisDevice.publish(nodeName.substr(0, 4) + ".8.*", nodeName + "\r\n" + "Effective_Period" + "\r\n" + value);
                    }
                }
            }
            if (req.param("fromstart")) {
                var fromstart = req.param("fromstart");
                var fromend = req.param("fromend");
                var value = trimall('{"dateRange":{"startDate":{' + dateToJson(fromstart) + '},"endDate":{' + dateToJson(fromend) + '}}}');
                res.send(value);
                if (obj[nodeName]["Effective_Period"] != value) {
                    redisDevice.hset(nodename, "Effective_Period", value);
                    if (req.param("ispublish")) {
                        redisDevice.publish(nodeName.substr(0, 4) + ".8.*", nodeName + "\r\n" + "Effective_Period" + "\r\n" + value);
                    }
                }
            }

        })
    }

})
function trimall(str) {

    var qian = [" ", "　", "\t", "\n", "\r"];
    str = str.replace(/ /g, "")
    str = str.replace(/　/g, "")
    str = str.replace(/\t/g, "")
    str = str.replace(/\n/g, "")
    str = str.replace(/\r/g, "")
    return str;
}
function dateToJson(riqi) {
    var sj = moment(riqi, "DD-MM-YYYY");
    var zhou = d.week();
    var jsstr = '"year":	' + sj.year() + ',\
	"month":	' + sj.month() + 1 + ',\
	"day_of_month":	' + sj.daysInMonth();
    return jsstr;
}
function setRedisUpdateTime(key) {
    var client = redis.createClient();
    var d = new Date();
    client.hset(key, "Update_Time", d.toLocaleDateString() + " " + d.toLocaleTimeString());
    client.quit();
}
function deviceXmlInit(filename) {
    var client = redis.createClient();
    if (fs.existsSync(filename)) {
        xml2js.parseString(fs.readFileSync(filename), function (err, result) {
            //console.log(result.root.key)
            result.root.key.forEach(element => {
                var key = element.$.number;
                for (var property in element) {
                    if (property != "$") {
                        console.log(property, element[property])
                        client.hset(key, property + "", element[property][0])
                    }
                }
            })

        })
    }
    client.quit();
}

function filePathTransform(filename) {
    if (!path.isAbsolute(filename)) {
        filename = path.resolve(programResourcesPath, filename)
    }
    return filename;
}

app.all("/program/resources/xmlRW.php", function (req, res, next) {
    //var par = req.query.par;
    var rw = req.param("rw");
    var fileName = filePathTransform(req.param("fileName"));

    if (rw == 'r') {
        if (!fs.existsSync(fileName)) {
            res.send("null");
        } else {
            res.send(fs.readFileSync(fileName));
        }
    } else {
        var content = req.param("content");
        fs.writeFileSync(fileName, content);
        res.send(content.length + "")
    }
    //console.log(arguments)
})

function getDevicesByKeys(keys) {
    var arr = [];
    keys.forEach(element => {
        var device = element.substr(0, 4);
        if (arr.indexOf(device) < 0) {
            arr.push(device);
        }
    });
    return arr;
}

app.get("/getWhoIsDevices", function (req, res) {
    iBacnet.getWhoIsData(req.query.whoisDelay * 1000 || 3000, function (err, data) {
        res.send(data)
    })
})

app.get("/generateBACnetXml", function (req, res) {
    var whoisDelay = req.query.whoisDelay * 1000;
    var propertys = req.query.propertys;
    var deivces = req.query.deivces;
    iBacnet.generateBACnetXml(whoisDelay, deivces, propertys);
    res.send();
    console.log(propertys, deivces)
})
