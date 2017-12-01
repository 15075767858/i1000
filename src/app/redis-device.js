const redis = require("redis");




class RedisDevice {
    constructor() {
        var client = redis.createClient();
        this.client = client;
    }
    getAllKeysJson(callback) {
        var __this = this;
        var obj = {};
        __this.keysAll(function (err, keys) {
            var count = 0;
            keys.forEach(key => {
                __this.hgetall(key, function (err, result) {
                    obj[key] = result;
                    count++;
                    if (count == keys.length) {
                        callback(err, obj);
                        __this.keysObj = obj;
                    }
                })
            })
        })
    }
    keysAll(callback) {
        this.client.keys("[0-9][0-9][0-9][0-9][0-9][0-9][0-9]", function (err, replies) {
            callback(err, replies);
        })
    }
    keys(pattern, callback) {
        this.client.keys(pattern || "[0-9][0-9][0-9][0-9][0-9][0-9][0-9]", function (err, replies) {
            callback(err, replies);
        })
    }
    hgetall(key, callback) {
        this.client.hgetall(key, function (err, result) {
            callback(err, result)
        })
    }
    hget(key, property, callback) {
        this.client.hget(key, property, function (err, replies) {
            callback(err, replies)
        })
    }
    publish(channel, value, callback) {
        this.client.publish(channel, value, callback)
    }
    quit() {
        this.client.quit();
    }
    getDevicesAll(keys, callback) {
        var __this = this;
        var arr = [];
        if (keys) {
            keys.forEach(element => {
                var device = element.substr(0, 4);
                if (arr.indexOf(device) < 0) {
                    arr.push(device);
                }
            });
            return arr;
        } else {
            __this.keysAll(function (err, keys) {
                keys.forEach(element => {
                    var device = element.substr(0, 4);
                    if (arr.indexOf(device) < 0) {
                        arr.push(device);
                    }
                });
                callback(arr)
            })
        }
    }
    getDevicesByKeys(keys) {
        var arr = [];
        keys.forEach(element => {
            var device = element.substr(0, 4);
            if (arr.indexOf(device) < 0) {
                arr.push(device);
            }
        });
        return arr;
    }
    getDeviceTree(callback) {
        var __this = this;
        __this.getAllKeysJson(function () {
            __this.keysAll(function (err, keys) {
                keys.sort();
                var root = __this.getDevicesByKeys(keys);
                callback(err, root)
            })
        })
    }
    getDevicesByKeys(arList) {
        var __this = this;
        //redis = this.client;
        var ip = this.ip;
        var root = {
            'checked': true,
            'qtip': "On Line",
            'text': ip,
            'children': []
        }
        var devices = __this.getDevicesAll(arList);

        devices.forEach(device => {
            root['children'].push({
                leaf: false,
                text: device,
                children: __this.getDevChildren(arList, device)
            })
        })

        return {
            text: ip,
            children: root
        }
        //echo json_encode(array('text' => $ip, 'children' => array($root)));
    }

    getDevChildren(arList, devValue) {
        var types = ['AI', 'AO', 'AV', 'BI', 'BO', 'BV', "Schedule"];
        var arr = [];
        for (var i = 0; i < types.length; i++) {
            var children = this.getChildren(arList, devValue, i);
            if (children.length) {
                arr.push({
                    text: types[i],
                    leaf: false,
                    children: children
                })
            }
        }
        //$arr = array();
        return arr;
    }

    getChildren(arList, devValue, type) {

        var __this = this;
        var arr = []
        arList.forEach(key => {
            if (key.substr(0, 5) == devValue + type) {
                var Object_Name = __this.keysObj[key]['Object_Name'];
                if (type >= 6) {
                    arr.push({
                        leaf: true,
                        text: Object_Name,
                        value: key,
                        type: type,
                        allowDrop: false,
                        allowDrag: false
                    })
                } else {
                    arr.push({
                        leaf: true,
                        text: Object_Name,
                        value: key,
                        type: type
                    })
                }
            }
        })
        return arr;
    }
    getDevList(callback) {
        this.getAllKeysJson(function (err, obj) {
            var arr = [];
            for (var item in obj) {
                arr.push({
                    value: item,
                    name: obj[item]["Object_Name"]
                })
            }
            callback(err, arr);
        })
    }
}

exports.RedisDevice = RedisDevice;
// new RedisDevice().getDevList(function (err, obj) {
//     console.log(arguments)
// })