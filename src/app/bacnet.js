var bacnet = require('./bacstack/index');
var bacnetutil = require("./bacnetutil")

// Initialize BACStack

//client.timeSync('192.168.253.253', new Date(), true);
// getWhoIsData(3000, function (err,data) {
//     console.log(data)
// })
function getWhoIsData(adpuTimeout, callback) {

    var resData = []
    for (let i = 0; i <= 2; i++) {
        setTimeout(function () {
            client.whoIs();
            if (i == 2) {
                setTimeout(function () {
                    client.close();
                    callback(null, resData)
                }, adpuTimeout)
            }
        }, i * adpuTimeout)
    }
    var client = new bacnet({
        adpuTimeout: adpuTimeout || 10000
    });
    client.timeSync('192.168.253.253', new Date(), true);
    client.on('iAm', function (device) {
        console.log(device)
        var address = device.address;
        if (device.npdu) {
            if (device.source) {
                address = { address: device.address, net: device.npdu.source.net, adr: device.npdu.source.adr };
            }
        }
        readObjectInfo(client, address, device.deviceId, 8, 8, function (err, result) {
            if (err) {
                console.log(err)
                return
            }
            var obj = result.values[0];
            var values = obj.values;
            var instance = obj.objectIdentifier.instance;
            var device_name = bacnetutil.searchProperty(values, 77);
            var vendor = bacnetutil.searchProperty(values, 121);
            var model = bacnetutil.searchProperty(values, 70);
            console.log("instance:", instance, "object_name:", device_name, "vendor:", vendor, "model:", model);
            var isHave = resData.find(function (value, index) {
                if (value.instance == instance & value.device_name == device_name & value.vendor == vendor & value.model == model) {
                    return true;
                }
            })
            if (!isHave) {
                resData.push({ instance: instance, device_name: device_name, vendor: vendor, model: model, prefix: "", suffix: "" });
            }
        });
    });
}
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
function test() {
    var client = new bacnet({
        adpuTimeout: 10000
    });
    readObjectInfo(client, { address: "192.168.253.253", net: "1100", adr: ["31"] }, "1031", 8, 8, function (err, res) {
        if(err){
            client.whoIs()
        }
        
        setTimeout(test,1000)
        console.log(err, res)
    });
}
//readDeviceInfo({ address: "192.168.253.253", net: "1100", adr: ["3"] }, "1103");
function readObjectInfo(client, ip, instance, objectType, propertyIdentifier, callback) {
    var requestArray = [{
        objectIdentifier: {
            type: objectType, //AI AO AV BI BO BV 
            instance: instance //实例号
        },
        propertyReferences: [{
            propertyIdentifier: propertyIdentifier || 8
        }]
    }];
    client.readPropertyMultiple(ip, requestArray, callback);
}

function readDeviceInfo(ip, instance, callback) {
    // Read Device Object
    var requestArray = [{
        objectIdentifier: {
            type: 8,
            instance: instance
        },
        propertyReferences: [{
            propertyIdentifier: 8
        }]
    }];

    client.readPropertyMultiple(ip, requestArray,
        function (err, result) {
            if (err) {
                console.log(err)
                return
            }
            var obj = result.values[0];
            var values = obj.values;
            var instance = obj.objectIdentifier.instance;
            var object_name = bacnetutil.searchProperty(values, 77);
            var vendor = bacnetutil.searchProperty(values, 121);
            var model = bacnetutil.searchProperty(values, 70);
            var object_list = bacnetutil.searchProperty(values, 76);

            console.log(object_list)
            console.log("instance:", instance, "object_name:", object_name, "vendor:", vendor, "model:", model);
            if (callback)
                callback(instance, object_name, vendor, model)
        }
    );
}


exports.getWhoIsData = getWhoIsData;
