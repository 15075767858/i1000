var bacnet = require('./bacstack/index');
var bacnetutil = require("./bacnetutil")


function test() {
    var client = new bacnet({
        adpuTimeout: 10000
    });
    readObjectInfo(client, { address: "192.168.253.253", net: "1100", adr: ["31"] }, "1031", 8, 8, function (err, res) {
        if (err) {
            client.whoIs()
        }

        setTimeout(test, 1000)
        console.log(err, res)
    });
    var client = new bacnet({
        adpuTimeout: 10000
    });
    client.whoIs()
    client.on('iAm', function (device) {
        if (device.deviceId == 1031) {
            readDeviceInfo(client, device, function (err, result) {
                console.log(arguments)
                if (!result) {

                }
            });
        }
    })
}
// Initialize BACStack

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
    var deviceCount = 0;
    var whoIsCount = 2
    var client = new bacnet({
        adpuTimeout: adpuTimeout
    });
    setTimeout(function () {
        client.close()
        callback(null, resData);
    }, adpuTimeout * whoIsCount + adpuTimeout * 2)
    WhoIsDevice(client, adpuTimeout, whoIsCount, function (device) {
        client.timeSync(device.address, new Date(), true);
        deviceCount++;
        var recryCount = 2;
        readDeviceInfo(client, device, readDeviceInfoCallback)
        function readDeviceInfoCallback(err, data) {
            if (err) {
                recryCount--;
                if (recryCount >= 0) {
                    readDeviceInfo(client, device, readDeviceInfoCallback)
                }
            }
            if (data) {
                var isHave = resData.find(function (value, index) {
                    if (value.instance == data.instance & value.device_name == data.device_name) {
                        return true
                    }
                })
                if (!isHave) {
                    resData.push(data)
                }
            }
        }
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

function readDeviceInfo(client, device, callback) {
    var address = device.address;
    if (device.npdu) {
        if (device.npdu.source) {
            address = { address: device.address, net: device.npdu.source.net, adr: device.npdu.source.adr };
        }
    }
    // Read Device Object
    readObjectInfo(client, address, device.deviceId, bacnet.enum.BacnetObjectTypes.OBJECT_DEVICE, bacnet.enum.BacnetPropertyIds.PROP_ALL, function (err, result) {
        if (err) {
            console.log(err, result)
            callback(err, null)
            //console.log(err)
            return
        }
        var obj = result.values[0];
        var values = obj.values;
        var instance = obj.objectIdentifier.instance;
        var device_name = bacnetutil.searchProperty(values, bacnet.enum.BacnetPropertyIds.PROP_OBJECT_NAME);
        var vendor = bacnetutil.searchProperty(values, bacnet.enum.BacnetPropertyIds.PROP_VENDOR_NAME);
        var model = bacnetutil.searchProperty(values, bacnet.enum.BacnetPropertyIds.PROP_MODEL_NAME);
        console.log("instance:", instance, "object_name:", device_name, "vendor:", vendor, "model:", model);
        if (instance != null & device_name != null) {
            callback(false, { instance: instance, device_name: device_name, vendor: vendor, model: model, prefix: "", suffix: "" })
        } else {
            callback(new Error("null "), null)
        }
    });
}
function readObjectInfo(client, address, instance, objectType, propertyIdentifier, callback) {
    var requestArray = [{
        objectIdentifier: {
            type: objectType, //AI AO AV BI BO BV 
            instance: instance //实例号
        },
        propertyReferences: [{
            propertyIdentifier: propertyIdentifier
        }]
    }];
    client.readPropertyMultiple(address, requestArray, callback);
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
