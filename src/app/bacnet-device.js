
var bacnet = require('./bacstack/index');
var bacnetenum = require("./bacstack/lib/bacnet-enum");
var bacnetutil = require("./bacnetutil")
var fs = require('fs')
class BACnetDevice {
    constructor(device, callback) {
        var self = this;
        self.devicePropertys = ["PROP_OBJECT_NAME", "PROP_OBJECT_TYPE", "PROP_SYSTEM_STATUS", "PROP_VENDOR_NAME", "PROP_VENDOR_IDENTIFIER", "PROP_MODEL_NAME", "PROP_PROTOCOL_VERSION", "PROP_FIRMWARE_REVISION", "PROP_APPLICATION_SOFTWARE_VERSION", "PROP_PROTOCOL_SERVICES_SUPPORTED", "PROP_PROTOCOL_OBJECT_TYPES_SUPPORTED", "PROP_MAX_APDU_LENGTH_ACCEPTED", "PROP_SEGMENTATION_SUPPORTED", "PROP_NUMBER_OF_APDU_RETRIES", "PROP_APDU_TIMEOUT", "PROP_DATABASE_REVISION", "PROP_MAX_MASTER", "PROP_MAX_INFO_FRAMES", "PROP_LOCAL_TIME", "PROP_LOCAL_DATE", "PROP_UTC_OFFSET", "PROP_DAYLIGHT_SAVINGS_STATUS"];
        if (typeof device == "string") {
            self.initDeviceInfo(device, function () {
                self.initResult(callback);
            });
        } else {
            self.initWhoIsInfo(device)
            self.initResult(callback);
        }
    }
    generateBACnetXml(propertys, callback) {
        var self = this;
        var obj = self.getWhoIsData()
        var device = self.device;
        callback(null, "device_" + self.deviceId, self.getObject_Name() + " Discovering object propertys ", 0)
        self.rootAddDevice(propertys, function (err, id, message, status) {
            if (callback) {
                callback(err, id, message, status)
            }
            //self.closeClient()
        })
    }
    rootAddDevice(propertys, callback) {
        var self = this;
        self.propertys = propertys;
        var propertys = propertys.slice()

        var client = self.getClient(), root = self.getRoot(), device = self.device;
        let propertysLen = 0;
        var deviceXml = root.ele('device', { address: self.address, instance: self.instance, net: self.net, adr: self.adr });
        callback(null, "device_" + self.deviceId, self.getObject_Name() + " Discovering object propertys ", 0)
        self.xmlDevcieAddPropertys(deviceXml)
        //迭代 AI AO BI BO ....
        self.xmlAddPropertysAll(deviceXml, propertys, callback, function () {
            callback(null, "device_" + self.deviceId, self.getObject_Name() + " Discovering object propertys ", 1)
            console.log("over")
            self.closeClient()
        })
        //whois device
    }

    xmlDevcieAddPropertys(deviceXml) {
        var self = this;
        self.devicePropertys.forEach(function (value, index) {
            deviceXml.ele(value.substr(5, value.length).toLowerCase(), {}, self[value])
        })
    }
    xmlAddPropertysAll(deviceXml, propertys, callback) {
        var self = this;
        var result = self.getResult();
        var Property_Name = propertys.shift();
        let Object_Type = bacnetenum.BacnetObjectTypes[Property_Name];
        if (Property_Name) {
            callback(null, "device_" + self.device.deviceId, self.getObject_Name() + " Discovering object propertys ", (self.propertys.length - propertys.length) / self.propertys.length)
            var instances = bacnetutil.readPropertyInstanceByObjectType(result, Object_Type)
            console.log(instances)
            self.xmlAddObjectAll(Object_Type, deviceXml, instances, function () {
                self.xmlAddPropertysAll(deviceXml, propertys, callback)
            })
        } else {
            //callback(null, "device_" + self.deviceId, self.getObject_Name() + " Discovering object propertys ", 1)
            self.closeClient()
        }
    }
    xmlAddObjectAll(Object_Type, deviceXml, instances, callback) {
        var self = this;
        var client = self.getClient(), device = self.device, result = self.getResult();
        var pointInstance = instances.shift();
        if (pointInstance != undefined) {
            let pointXml = deviceXml.ele("point", { type: Object_Type, instance: pointInstance })
            bacnetutil.readObjectInfoAll(client, device, pointInstance, Object_Type, function (err, res) {
                if (err) {
                    callback(err)
                    self.xmlAddObjectAll(Object_Type, deviceXml, instances, callback)
                    return;
                }
                for (let el in res) {
                    pointXml.ele(el.substr(5, el.length).toLowerCase(), {}, res[el])
                }
                self.xmlAddObjectAll(Object_Type, deviceXml, instances, callback)
            })
        } else {
            callback()
        }
    }

    getWhoIsData() {
        var self = this;
        var obj = {};
        obj.address = self.device.address;
        obj.instance = self.device.deviceId;
        obj.net = self.net;
        obj.adr = self.adr;
        self.devicePropertys.forEach(function (value, index) {
            obj[value] = self[value]
        })
        return obj;
    }
    initDeviceInfo(deviceId, callback) {
        console.log("initDeviceInfo " + deviceId)
        var self = this;
        var client = new bacnet()
        client.whoIs()
        client.on('iAm', function (device) {
            if (device.deviceId - deviceId == 0) {
                client.close()
                self.initWhoIsInfo(device)
                callback(device)
            }
        })
    }
    initWhoIsInfo(device) {
        var self = this;
        self.device = device;
        if (device.address) {
            self.address = device.address;
        }
        if (device.deviceId) {
            self.instance = device.deviceId;
            self.deviceId = device.deviceId;
        }
        if (device.npdu) {
            if (device.npdu.source) {
                if (device.npdu.source.net !== undefined) {
                    self.net = device.npdu.source.net;
                }
                if (device.npdu.source.adr !== undefined) {
                    self.adr = device.npdu.source.adr[0];
                }
            }
        }
    }
    initResult(callback) {
        console.log(callback, "initResult")
        var self = this;
        var client = self.getClient(), root = self.getRoot(), device = self.device;
        bacnetutil.readObjectInfo(client, device, device.deviceId, bacnetenum.BacnetObjectTypes.OBJECT_DEVICE, bacnetenum.BacnetPropertyIds.PROP_ALL,
            function (err, result) {
                if (err) {
                    console.log(err)
                    client.whoIs()
                    self.initResult(callback);
                    callback(err, null)
                    return
                }
                self.setResult(result);
                callback(null, self)
            })
    }
    getObject_Name() {
        var self = this;
        return bacnetutil.searchProperty(self.result, bacnetenum.BacnetPropertyIds.PROP_OBJECT_NAME)
    }
    getResult() {
        return this.result;
    }

    setResult(result) {
        var self = this;
        self.result = result;
        self.devicePropertys.forEach(function (property, index, arr) {
            var value = bacnetutil.searchProperty(result, bacnetenum.BacnetPropertyIds[property])
            console.log(value)
            self[property] = value;
        })
        return this;
    }
    setClient(client) {
        this.client = client;
        return this;
    }
    getClient(opt) {
        if (this.client) {
            return this.client;
        } else {
            var client = new bacnet(opt||{adpuTimeout:10000});
            this.client = client;
            return this.client;
        }
    }
    closeClient() {
        this.getClient().close();
    }
    setRoot(root) {
        this.root = root;
        return this;
    }
    getRoot() {
        return this.root;
    }
    getInfo(device) {
    }
}
exports.BACnetDevice = BACnetDevice;

