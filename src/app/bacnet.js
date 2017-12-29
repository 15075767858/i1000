var bacnet = require('./bacstack/index');
var bacnetenum = require("./bacstack/lib/bacnet-enum");
var bacnetutil = require("./bacnetutil");
var bacnetdevice = require("./bacnet-device")
var xml2js = require("xml2js");
var fs = require("fs-extra");
var xmlbuilder = require("xmlbuilder");
var crc = require("./crc");


// Discover Devices
//client.on('iAm', function (device) {
//console.log(device)
// console.log('address: ', device.npdu);
// console.log('address: ', device.address);
// console.log('deviceId: ', device.deviceId);
// console.log('maxAdpu: ', device.maxApdu);
// console.log('segmentation: ', device.segmentation);
// console.log('vendorId: ', device.vendorId);
//  readDeviceInfo({ address: device.address, net: device.npdu.source.net, adr: device.npdu.source.adr }, device.deviceId);
//readDeviceInfo(device.address, device.deviceId, function (data) { resData.push(data); })
//});
//client.whoIs();
//readDeviceInfo("192.168.253.253", "1103");
//readDeviceInfo("192.168.253.253", "1031");
//readDeviceInfo({ address: "192.168.253.253", net: "1100", adr: ["3"] }, "1103");
//test()
function test() {
    var client = new bacnet({
        adpuTimeout: 10000
    });
    var root = xmlbuilder.create("root")

    bacnetutil.BACnetIAm(client, null, function (device) {
        console.log(device)
        var deviceXml = root.ele('device', deviceToXmlObj(device));
        readObjectInfo(client, device, device.deviceId, 8, 8, function (err, result) {
            if (err) {
                console.log(err)
                return
            }
            var propertys = ['OBJECT_ACCUMULATOR',
                'OBJECT_ANALOG_INPUT',
                'OBJECT_ANALOG_OUTPUT',
                'OBJECT_ANALOG_VALUE',
                'OBJECT_AVERAGING',
                'OBJECT_BINARY_INPUT',
                'OBJECT_BINARY_OUTPUT',
                'OBJECT_BINARY_VALUE',
                'OBJECT_CALENDAR',
                'OBJECT_COMMAND',
                'OBJECT_EVENT_ENROLLMENT',
                'OBJECT_FILE',
                'OBJECT_GROUP',
                'OBJECT_LOOP',
                'OBJECT_LIFE_SAFETY_POINT',
                'OBJECT_LIFE_SAFETY_ZONE',
                'OBJECT_MULTI_STATE_INPUT',
                'OBJECT_MULTI_STATE_OUTPUT',
                'OBJECT_MULTI_STATE_VALUE',
                'OBJECT_NOTIFICATION_CLASS',
                'OBJECT_PROGRAM',
                'OBJECT_PULSE_CONVERTER',
                'OBJECT_SCHEDULE',
                'OBJECT_TRENDLOG'];

            propertys.forEach(function (Property_Name, index) {
                var Object_Type = bacnetenum.BacnetObjectTypes[Property_Name]
                console.log(propertysLen)
                bacnetutil.readPropertyInstanceByObjectType(result, Object_Type)
                    .forEach(function (pointInstance, pointIndex) {

                        let pointXml = deviceXml.ele("point", { type: Object_Type, instance: pointInstance })
                        readObjectInfoAll(client, device, pointInstance, Object_Type, function (err, res) {
                            for (let el in res) {
                                pointXml.ele(el.substr(5, el.length).toLowerCase(), {}, res[el])
                            }
                            var xml = deviceXml.end({ pretty: true }).toString()
                            fs.writeFileSync("./test2.xml", xml)
                            //console.log(arguments)
                        })
                    })
            })
        })
    })

}

// new bacnetutil.bacnetdevice.BACnetDevice("1063", function (err, device) {
//     console.log(arguments)
// })

// var client = new bacnet()
// var programFile = fs.readFileSync("C:\\Users\\Administrator\\Desktop\\程序文件\\1001")
// programFile = crc.BufferCrc16(programFile)
// var address = { address: '192.168.253.253', net: 1100, adr: [63] }
// client.writeFile(address, { type: 10, instance: 1 }, 0, 450, programFile, function (err, value) {
//     console.log(err, value)
// })
//60340 534 
//FF FF FF 64 EB FF FF
//testWriteFile()
function testWriteFile() {
    
        var client = new bacnet({
            adpuTimeout: 10000
        })
        bacnetutil.BACnetIAm(client, ["1063"], function (device) {
            console.log(device)
            var address = device.address;
            if (device.npdu) {
                if (device.npdu.source) {
                    address = { address: device.address, net: device.npdu.source.net, adr: device.npdu.source.adr };
                }
            }
            console.log(address)
            var programFile = fs.readFileSync("C:\\Users\\Administrator\\Desktop\\程序文件\\1001")
            programFile = crc.BufferCrc16(programFile)
            //return ;
            client.writeProperty(address, bacnetenum.BacnetObjectTypes.OBJECT_FILE,
                1,//实例号
                bacnetenum.BacnetPropertyIds.PROP_FILE_SIZE,
                0,//优先级
                [{
                    type: 2,
                    value: programFile.length
                }], function (err, value) {
                    if (err) {
                        testWriteFile()
                    } else {
                        //console.log(programFile.slice(0, 450).toJSON())
                        client.writeFile(address, { type: 10, instance: 1 }, 0, 450, programFile.slice(0, 450), function (err, value) {
                            console.log(err, value)
                        })
                    }
                })
        })
    }
    
    
    //test2(root, devices, propertys, 3000)
    function test2(root, devices, propertys, adpuTimeout, callback) {
        var device = devices.pop();
        if (device) {
            device = [device]
            generateBACnetXml(root, adpuTimeout, devices, propertys, function () {
                console.log(arguments)
                console.log(devices)
                test2(root, devices, propertys, adpuTimeout, callback)
            })
        }
    }
    
    function generateBACnetXml(root, adpuTimeout, devices, propertys, callback) {
    
        var client = new bacnet({
            adpuTimeout: adpuTimeout || 10000
        });
        bacnetutil.BACnetIAm(client, devices, function (device) {
            console.log(device)
            rootAddDevice(client, root, device, function (err, id, message, status) {
                callback(err, id, message, status)
                client.close()
            })
        })
    }
    
    function rootAddDevice(client, root, device, callback) {
        let propertysLen = 0;
        readObjectInfo(client, device, device.deviceId, bacnet.enum.BacnetObjectTypes.OBJECT_DEVICE, bacnet.enum.BacnetPropertyIds.PROP_ALL,
            function (err, result) {
                if (err) {
                    console.log(err)
                    rootAddDevice(client, root, device, callback)
                    return
                }
                var deviceXml = root.ele('device', deviceToXmlObj(device));
                let object_name = bacnetutil.searchProperty(result, bacnetenum.BacnetPropertyIds.PROP_OBJECT_NAME)
                //迭代 AI AO BI BO ....
                xmlAddPropertysAll(client, device, propertys, deviceXml, result, function () {
                    callback(null, "device_" + device.deviceId, object_name + " Add deivce to project ", 1)
                    console.log("over")
                })
    
                // propertys.forEach(function (Property_Name, index) {
                //     propertysLen++;
                //     callback(null, "objcet_" + device.deviceId, object_name + " Discovering object properties", propertysLen / propertys.length)
                //     let Object_Type = bacnetenum.BacnetObjectTypes[Property_Name]
    
                //     var instances = bacnetutil.readPropertyInstanceByObjectType(result, Object_Type)
                //     xmlAddObjectAll(client, device, Object_Type, deviceXml, instances, function () {
                //         console.log("全完了")
    
                //         var xml = deviceXml.end({ pretty: true }).toString()
                //         fs.writeFileSync("./test2.xml", xml)
                //     })
                // })
                // var xml = deviceXml.end({ pretty: true }).toString()
                // fs.writeFileSync("./test2.xml", xml)
                // instances.forEach(function (pointInstance, pointIndex) {
                //     let pointXml = deviceXml.ele("point", { type: Object_Type, instance: pointInstance })
                //     readObjectInfoAll(client, device, pointInstance, Object_Type, function (err, res) {
                //         for (let el in res) {
                //             pointXml.ele(el.substr(5, el.length).toLowerCase(), {}, res[el])
                //         }
                //         var xml = deviceXml.end({ pretty: true }).toString()
                //         fs.writeFileSync("./test2.xml", xml)
                //     })
                // })
            })
    }
    
    exports.generateBACnetXml = generateBACnetXml;
    function xmlAddPropertysAll(client, device, propertys, deviceXml, result, callback) {
        var Property_Name = propertys.shift()
        let Object_Type = bacnetenum.BacnetObjectTypes[Property_Name]
        console.log(instances)
        if (Property_Name) {
            var instances = bacnetutil.readPropertyInstanceByObjectType(result, Object_Type)
            xmlAddObjectAll(client, device, Object_Type, deviceXml, instances, function () {
                console.log("完了一个 property")
                var xml = deviceXml.end({ pretty: true }).toString()
                fs.writeFileSync("./test2.xml", xml)
                xmlAddPropertysAll(client, device, propertys, deviceXml, result, callback)
            })
        } else {
            callback()
        }
    }
    function xmlAddObjectAll(client, device, Object_Type, deviceXml, instances, callback) {
        var pointInstance = instances.shift();
        if (pointInstance != undefined) {
            let pointXml = deviceXml.ele("point", { type: Object_Type, instance: pointInstance })
            readObjectInfoAll(client, device, pointInstance, Object_Type, function (err, res) {
                if (err) {
                    xmlAddObjectAll(client, device, Object_Type, deviceXml, instances, callback)
                    return;
                }
                for (let el in res) {
                    pointXml.ele(el.substr(5, el.length).toLowerCase(), {}, res[el])
                }
                xmlAddObjectAll(client, device, Object_Type, deviceXml, instances, callback)
            })
        } else {
            callback()
        }
    }
    //whois device
    function deviceToXmlObj(device) {
        var obj = {}
        if (device.address) {
            obj.address = device.address;
        }
        if (device.deviceId) {
            obj.instance = device.deviceId;
        }
        if (device.npdu) {
            if (device.npdu.source) {
                if (device.npdu.source.net !== undefined) {
                    obj.net = device.npdu.source.net;
                }
                if (device.npdu.source.adr !== undefined) {
                    obj.adr = device.npdu.source.adr;
                }
            }
        }
        return obj;
    }
    
    // getWhoIsData(3000, function (err, data) {
    //     console.log(data)
    // })
    //获得bacnet配置第三页的whois 数据 
    function getWhoIsData(adpuTimeout, callback) {
        var resData = [];
        var whoIsCount = 2;
        var client = new bacnet({
            adpuTimeout: adpuTimeout
        });
        setTimeout(function () {
            client.close()
            callback(null, resData);
        }, adpuTimeout * (whoIsCount + 2))
        bacnetutil.BACnetIAm(client, null, function (device) {
            client.timeSync(device.address, new Date(), true);
            readDeviceInfo(client, device, readDeviceInfoCallback)
            var recryCount = 2;
            function readDeviceInfoCallback(err, data) {
                console.log(data)
                if (err) {
                    recryCount--;
                    if (recryCount >= 0) {
                        readDeviceInfo(client, device, readDeviceInfoCallback)
                    }
                }
                if (data)
                    resData.push(data)
            }
        })
    }

    function getWhoIsData2(adpuTimeout, callback) {
        var resData = [];
        var whoIsCount = 2;
        var client = new bacnet({
            adpuTimeout: adpuTimeout
        });
        var intval = setInterval(function () {
            client.whoIs()
        }, adpuTimeout)
        setTimeout(function () {
            clearInterval(intval)
            client.close()
            callback(null, resData);
        }, adpuTimeout * (whoIsCount + 1))
        bacnetutil.BACnetIAm(client, null, function (device) {
            if (device.npdu) {
                if (device.npdu.source) {
                    if (device.npdu.source.net !== undefined) {
                        device.net = device.npdu.source.net;
                    }
                    if (device.npdu.source.adr !== undefined) {
                        device.adr = device.npdu.source.adr[0];
                    }
                }
            }
            client.timeSync(device.address, new Date(), true);
            resData.push(device)
        })
    }
    
    
    function WhoIsDevice(client, adpuTimeout, whoIsCount, callback) {
        //var resData = []
    
        for (let i = 0; i <= whoIsCount; i++) {
            setTimeout(function () {
                console.log(i);
                client.whoIs();
                if (i == whoIsCount) {
                    setTimeout(function () {
                        //client.close();
                    }, adpuTimeout)
                }
            }, i * adpuTimeout)
        }
        client.on('iAm', callback)
    }
    
    
    
    function readObjectInfoAll(client, address, instance, objectType, callback) {
    
        readObjectInfo(client, address, instance, objectType, bacnetenum.BacnetPropertyIds.PROP_ALL, function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            var resObj = {}
            for (var property in bacnetenum.BacnetPropertyIds) {
                var id = bacnetenum.BacnetPropertyIds[property];
                var res = bacnetutil.searchProperty(result, id)
                //console.log(id, property, res)
                if (!(res === undefined || res === null)) {
                    resObj[property] = res
                }
            }
            //console.log(resObj)
            callback(null, resObj);
        })
    }
    function readDeviceInfo(client, device, callback) {
    
        // Read Device Object
        readObjectInfo(client, device, device.deviceId, bacnet.enum.BacnetObjectTypes.OBJECT_DEVICE, bacnet.enum.BacnetPropertyIds.PROP_ALL, function (err, result) {
            if (err) {
                console.log(err, result)
                callback(err, null)
                return
            }
            var obj = result.values[0];
            var values = obj.values;
            var instance = obj.objectIdentifier.instance;
            var device_name = bacnetutil.searchProperty(result, bacnet.enum.BacnetPropertyIds.PROP_OBJECT_NAME);
            var vendor = bacnetutil.searchProperty(result, bacnet.enum.BacnetPropertyIds.PROP_VENDOR_NAME);
            var model = bacnetutil.searchProperty(result, bacnet.enum.BacnetPropertyIds.PROP_MODEL_NAME);
            console.log("instance:", instance, "object_name:", device_name, "vendor:", vendor, "model:", model);
            if (instance != null & device_name != null) {
                callback(false, { instance: instance, device_name: device_name, vendor: vendor, model: model, prefix: "", suffix: "" })
            } else {
                callback(new Error("null "), null)
            }
        });
    }
    function readObjectInfo(client, device, instance, objectType, propertyIdentifier, callback) {
        var address = device.address;
        if (device.npdu) {
            if (device.npdu.source) {
                address = { address: device.address, net: device.npdu.source.net, adr: device.npdu.source.adr };
            }
        }
        var requestArray = [{
            objectIdentifier: {
                type: objectType, //AI AO AV BI BO BV 
                instance: instance //实例号
            },
            propertyReferences: [{
                propertyIdentifier: propertyIdentifier
            }]
        }];
        client.readPropertyMultiple(address, requestArray, function (err, result) {
            if (err) {
                console.log(err)
                // if (!recryCount) {
                //     recryCount = 0
                // }
                // recryCount++;
                // if (recryCount >= 50) {
                //     callback(err, result)
                // }
                //readObjectInfo(client, device, instance, objectType, propertyIdentifier, callback)
                callback(err, result)
            } else {
                console.log(result)
                callback(err, result)
            }
        });
    }
    /* getWhoIsData2(3000,function(err,devices){
        console.log(arguments)
    }) */
    exports.getWhoIsData = getWhoIsData;
    exports.getWhoIsData2 = getWhoIsData2;