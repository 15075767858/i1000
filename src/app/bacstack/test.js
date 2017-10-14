var bacnet = require('./index.js');
var bacnetutil = require("./bacnetutil")
var baServices = require('./lib/bacnet-services');
// Initialize BACStack
var client = new bacnet({
    adpuTimeout: 10000
});

var resData = []
// Discover Devices
client.on('iAm', function (device) {
    //console.log(device)
    // console.log('address: ', device.npdu);
    // console.log('address: ', device.address);
    // console.log('deviceId: ', device.deviceId);
    // console.log('maxAdpu: ', device.maxApdu);
    // console.log('segmentation: ', device.segmentation);
    // console.log('vendorId: ', device.vendorId);
    readDeviceInfo({ address: device.address, net: device.npdu.source.net, adr: device.npdu.source.adr }, device.deviceId);
    //readDeviceInfo(device.address, device.deviceId, function (data) { resData.push(data); })
});

//client.whoIs();
// setInterval(function () {
//     client.whoIs();
// }, 12000)

//readDeviceInfo("192.168.253.253", "1103");
//readDeviceInfo("192.168.253.253", "1031");

//readDeviceInfo({ address: "192.168.253.253", net: "1100", adr: ["31"] }, "1031");
readDeviceInfo({ address: "192.168.253.253", net: "1100", adr: ["3"] }, "1103");

//readObjectInfo({ address: "192.168.253.253", net: "1100", adr: ["31"] }, "1031")
function readObjectInfo(ip, instance, callback) {
    var requestArray = [{
        objectIdentifier: {
            type: 0, //AI AO AV BI BO BV 
            instance: 3 //实例号
        },
        propertyReferences: [{
            propertyIdentifier: 8
        }]
    }];
    client.readPropertyMultiple(ip, requestArray, function (err, result) {
        if (err) {
            console.log(err)
            return
        }
        var obj = result.values[0];
        var values = obj.values;
        console.log(values)
        if (callback)
            callback(instance, object_name, vendor, model)
    });
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
    // client.readProperty(ip, 8, instance, 77, null, function (err, value) {
    //     console.log(arguments)
    //     //console.log(value.valueList)
    // })

    client.readPropertyMultiple(ip, requestArray, function (err, result) {
        if (err) {
            console.log(err)
            return
        }
        var obj = result.values[0];
        var values = obj.values;
        var instance = obj.objectIdentifier.instance;
        var object_name = bacnetutil.searchProperty(values, 77);
        //console.log("instance:", instance, "object_name:", object_name)
        var vendor = bacnetutil.searchProperty(values, 121);
        var model = bacnetutil.searchProperty(values, 70);
        console.log("instance:", instance, "object_name:", object_name, "vendor:", vendor, "model:", model);
        if (callback)
            callback(instance, object_name, vendor, model)
    });
}
