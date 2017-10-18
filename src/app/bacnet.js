var bacnet = require('./bacstack/index');
var bacnetenum = require("./bacstack/lib/bacnet-enum");
var bacnetutil = require("./bacnetutil")
var xml2js = require("xml2js");
var fs = require("fs");
test()
function test() {

    var client = new bacnet({
        adpuTimeout: 10000
    });
    client.whoIs()
    bacnetutil.BACnetIAm(client, 1031, function (device) {
        console.log(device)
        readObjectInfo(client, device, device.deviceId, 8, 8, function (err, result) {
            if (err) {
                console.log(err)
                return
            }
            var Property_Name = "OBJECT_ANALOG_INPUT";
            var Object_Type = bacnetenum.BacnetObjectTypes[Property_Name]
            var resArr = bacnetutil.readPropertyInstanceByObjectType(result, Object_Type)

            for (let i = 0; i < resArr.length; i++) {
                readObjectInfoAll(client, device, resArr[i], Object_Type, function (err, res) {
                    console.log(arguments)
                })
            }
        })
    })
    //client.on('iAm', function (device) {
    //if (device.deviceId == 1031) {
    // readObjectInfo(client, device.address, 1, bacnet.enum.BacnetObjectTypes.OBJECT_ANALOG_INPUT, bacnet.enum.BacnetPropertyIds.PROP_ALL, function (err, result) {
    //     var Property_Name = "OBJECT_ANALOG_INPUT";
    //     bacnetutil.readPropertyInstanceByName(result, Property_Name)

    //     console.log(arguments)
    // })
    // readDeviceInfo(client, device, function (err, result) {
    //     console.log(arguments)
    //     if (!result) {
    //     }
    // });
    //}
    //})
}


// Initialize BACStack
//generateBACnetXml(["1031"], )
function generateBACnetXml(devices, propertys) {
    var adpuTimeout = 3000
    var client = new bacnet({
        adpuTimeout: adpuTimeout
    });
    WhoIsDevice(client, adpuTimeout, 1, function (device) {
        console.log(device)
        if (devices.indexOf(device.deviceId)) {
            var address = device.address;
            if (device.npdu) {
                if (device.npdu.source) {
                    address = { address: device.address, net: device.npdu.source.net, adr: device.npdu.source.adr };
                }
            }
            readObjectInfo(client, address, device.deviceId, bacnet.enum.BacnetObjectTypes.OBJECT_DEVICE, bacnet.enum.BacnetPropertyIds.PROP_ALL, function (err, result) {
                if (result) {
                    var builder = new xml2js.Builder();
                    var xml = builder.buildObject(result);
                    fs.writeFileSync("test.xml", xml);
                    console.log(err, result)
                    //bacnetutil.readAllProertys(result);
                }
            })

        }
    })
}
//client.timeSync('192.168.253.253', new Date(), true);
// getDevices(3000, 1, function (err, result) {
//     console.log(err, result);
// })
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
    }, adpuTimeout * whoIsCount + adpuTimeout * 2)
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

    // WhoIsDevice(client, adpuTimeout, whoIsCount, function (device) {
    //     client.timeSync(device.address, new Date(), true);
    //     deviceCount++;
    //     var recryCount = 2;
    //     readDeviceInfo(client, device, readDeviceInfoCallback)
    // function readDeviceInfoCallback(err, data) {
    //     if (err) {
    //         recryCount--;
    //         if (recryCount >= 0) {
    //             readDeviceInfo(client, device, readDeviceInfoCallback)
    //         }
    //     }
    //     if (data) {
    //         var isHave = resData.find(function (value, index) {
    //             if (value.instance == data.instance & value.device_name == data.device_name) {
    //                 return true
    //             }
    //         })
    //         if (!isHave) {
    //             resData.push(data)
    //         }
    //     }
    // }
    // })
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
        console.log(resObj)
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
function readObjectInfo(client, device, instance, objectType, propertyIdentifier, callback, recryCount) {
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
            if (recryCount == undefined) {
                recryCount = 0
            }
            if (recryCount >= 5) {
                callback(err, result)
            }
            readObjectInfo(client, device, instance, objectType, propertyIdentifier, callback, recryCount++)
        } else {
            callback(err, result)
        }
    });
}

exports.getWhoIsData = getWhoIsData;

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
