var bacnet = require('./bacstack/index');
var bacnetenum = require('./bacstack/index').enum;
var benum = require('./bacstack/lib/bacnet-enum');
var xmlbuilder = require("xmlbuilder");
var bacnetdevice = require("./bacnet-device")
var dateFormat = require('dateformat');
var fs = require('fs-extra')

// getWhoIsData(3000, function (err,data) {
//     console.log(arguments)
// })
function getWhoIsData(adpuTimeout, callback) {
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
    }, adpuTimeout * (whoIsCount + 2))
    var deviceCount = 0;
    BACnetIAm(client, null, function (device) {
       
        deviceCount++;
        client.timeSync(device.address, new Date(), true);
        new bacnetdevice.BACnetDevice(device, function (err, bacnetdevice) {
            if (!err) {
                resData.push(bacnetdevice.getWhoIsData())
                //callback(null,resData)
            }
        })
    })
}
exports.getWhoIsData = getWhoIsData;
// var propertys = ['OBJECT_ACCUMULATOR', 'OBJECT_ANALOG_INPUT', 'OBJECT_ANALOG_OUTPUT', 'OBJECT_ANALOG_VALUE', 'OBJECT_AVERAGING', 'OBJECT_BINARY_INPUT', 'OBJECT_BINARY_OUTPUT', 'OBJECT_BINARY_VALUE', 'OBJECT_CALENDAR', 'OBJECT_COMMAND', 'OBJECT_EVENT_ENROLLMENT', 'OBJECT_FILE', 'OBJECT_GROUP', 'OBJECT_LOOP', 'OBJECT_LIFE_SAFETY_POINT', 'OBJECT_LIFE_SAFETY_ZONE', 'OBJECT_MULTI_STATE_INPUT', 'OBJECT_MULTI_STATE_OUTPUT', 'OBJECT_MULTI_STATE_VALUE', 'OBJECT_NOTIFICATION_CLASS', 'OBJECT_PROGRAM', 'OBJECT_PULSE_CONVERTER', 'OBJECT_SCHEDULE', 'OBJECT_TRENDLOG'];
// var devices = ["1031"];
// generateBACnetXml(null, devices, propertys, function (err, id, message, status) {
//     console.log(arguments)
// })

function generateBACnetXml(root, devices, propertys, callback) {
    console.log("generateBACnetXml")
    var xmlFile = "/mnt/nandflash/facilty/";
    fs.ensureDir(xmlFile, (err) => {
        console.log(err)
    })
    for (var i = 0; i < devices.length; i++) {
        devices[i] = devices[i] + ""
    }
    if (!root) {
        root = xmlbuilder.create("root");
    }
    var device = devices.pop();
    if (device) {
        callback(null, "device_" + device.deviceId, " Add deivce to project", 1)
        new bacnetdevice.BACnetDevice(device, function (err, bacnetdevice) {
            if (err) {
                callback(err)
                return;
            }
            bacnetdevice.setRoot(root).generateBACnetXml(propertys, function (err, id, message, status) {
                console.log(arguments)
                generateBACnetXml(root, devices, propertys, callback)
                callback(err, id, message, status)
            })
        })
    } else {
        var xml = root.end({ pretty: true }).toString()
        fs.writeFileSync(xmlFile + "BACnetConfig.xml", xml)
    }
}

exports.generateBACnetXml = generateBACnetXml;
function readAllProertys(result) {

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
        'OBJECT_TRENDLOG']


    console.log(Object_List)
    //bacnetenum.BacnetPropertyIds
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
            var res = searchProperty(result, id)
            //console.log(id, property, res)
            if (!(res === undefined || res === null)) {
                resObj[property] = res
            }
        }
        //console.log(resObj)
        callback(null, resObj);
    })
}
exports.readObjectInfoAll = readObjectInfoAll;
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
    client.readPropertyMultiple(address, requestArray, callback);
}
exports.readObjectInfo = readObjectInfo;
function BACnetIAm(client, deviceIds, callback) {
    var devices = [];
    client.whoIs()
    client.on('iAm', function (device) {
        if (devices.includes(device.deviceId) == false) {
            devices.push(device.deviceId);
            if (deviceIds) {
                for (var i = 0; i < deviceIds.length; i++) {
                    if (deviceIds[i] - device.deviceId == 0) {
                        callback(device)
                    }
                }
            } else {
                callback(device);
            }
        }
    })
}
exports.BACnetIAm = BACnetIAm;
exports.readPropertyInstanceByObjectType = readPropertyInstanceByObjectType;

function readPropertyInstanceByObjectType(result, Object_Type) {
    var Object_List = searchProperty(result, benum.BacnetPropertyIds.PROP_OBJECT_LIST);
    if (!Object_List) {
        return Object_List;
    }
    var resArr = [];
    for (var i = 0; i < Object_List.length; i++) {
        var type = Object_List[i].value.type;
        var instance = Object_List[i].value.instance;
        if (Object_Type == type) {
            resArr.push(instance);
        }
    }
    return resArr

}

function searchProperty(result, propertyIdentifier) {
    var obj = result.values[0];
    var arr = obj.values;

    var BacnetPropertyIds = benum.BacnetPropertyIds;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].propertyIdentifier == propertyIdentifier) {
            switch (propertyIdentifier) {
                case BacnetPropertyIds.PROP_OBJECT_IDENTIFIER:
                    return PROP_OBJECT_IDENTIFIER(arr[i])
                case BacnetPropertyIds.PROP_OBJECT_NAME:
                    return PROP_OBJECT_NAME(arr[i]);
                case BacnetPropertyIds.PROP_VENDOR_NAME:
                    return PROP_VENDOR_NAME(arr[i])
                case BacnetPropertyIds.PROP_MODEL_NAME:
                    return PROP_MODEL_NAME(arr[i])
                case BacnetPropertyIds.PROP_OBJECT_LIST:
                    return PROP_OBJECT_LIST(arr[i])
                case BacnetPropertyIds.PROP_OBJECT_TYPE:
                    return PROP_OBJECT_TYPE(arr[i]);
                case BacnetPropertyIds.PROP_SYSTEM_STATUS:
                    return PROP_SYSTEM_STATUS(arr[i]);
                case BacnetPropertyIds.PROP_VENDOR_IDENTIFIER:
                    return PROP_VENDOR_IDENTIFIER(arr[i]);
                case BacnetPropertyIds.PROP_FIRMWARE_REVISION:
                    return PROP_FIRMWARE_REVISION(arr[i])
                case BacnetPropertyIds.PROP_APPLICATION_SOFTWARE_VERSION:
                    return PROP_APPLICATION_SOFTWARE_VERSION(arr[i])
                case BacnetPropertyIds.PROP_PROTOCOL_VERSION:
                    return PROP_PROTOCOL_VERSION(arr[i])
                case BacnetPropertyIds.PROP_PROTOCOL_REVISION:
                    return PROP_PROTOCOL_REVISION(arr[i])
                case BacnetPropertyIds.PROP_PROTOCOL_SERVICES_SUPPORTED:
                    return PROP_PROTOCOL_SERVICES_SUPPORTED(arr[i]);
                case BacnetPropertyIds.PROP_PROTOCOL_OBJECT_TYPES_SUPPORTED:
                    return PROP_PROTOCOL_OBJECT_TYPES_SUPPORTED(arr[i]);
                case BacnetPropertyIds.PROP_MAX_APDU_LENGTH_ACCEPTED:
                    return PROP_MAX_APDU_LENGTH_ACCEPTED(arr[i]);
                case BacnetPropertyIds.PROP_SEGMENTATION_SUPPORTED:
                    return PROP_SEGMENTATION_SUPPORTED(arr[i]);
                case BacnetPropertyIds.PROP_APDU_TIMEOUT:
                    return PROP_APDU_TIMEOUT(arr[i])
                case BacnetPropertyIds.PROP_NUMBER_OF_APDU_RETRIES:
                    return PROP_NUMBER_OF_APDU_RETRIES(arr[i])
                case BacnetPropertyIds.PROP_DEVICE_ADDRESS_BINDING:
                    return PROP_DEVICE_ADDRESS_BINDING(arr[i])
                case BacnetPropertyIds.PROP_DATABASE_REVISION:
                    return PROP_DATABASE_REVISION(arr[i])
                case BacnetPropertyIds.PROP_MAX_MASTER:
                    return PROP_MAX_MASTER(arr[i])
                case BacnetPropertyIds.PROP_MAX_INFO_FRAMES:
                    return PROP_MAX_INFO_FRAMES(arr[i])
                case BacnetPropertyIds.PROP_DESCRIPTION:
                    return PROP_DESCRIPTION(arr[i])
                case BacnetPropertyIds.PROP_LOCAL_TIME:
                    return PROP_LOCAL_TIME(arr[i])
                case BacnetPropertyIds.PROP_UTC_OFFSET:
                    return PROP_UTC_OFFSET(arr[i])
                case BacnetPropertyIds.PROP_LOCAL_DATE:
                    return PROP_LOCAL_DATE(arr[i])
                case BacnetPropertyIds.PROP_DAYLIGHT_SAVINGS_STATUS:
                    return PROP_DAYLIGHT_SAVINGS_STATUS(arr[i])
                case BacnetPropertyIds.PROP_LOCATION:
                    return PROP_LOCATION(arr[i])
                case BacnetPropertyIds.PROP_ACTIVE_COV_SUBSCRIPTIONS:
                    return PROP_ACTIVE_COV_SUBSCRIPTIONS(arr[i])
                case BacnetPropertyIds.PROP_EVENT_ENABLE:
                    return PROP_EVENT_ENABLE(arr[i])
                case BacnetPropertyIds.PROP_LIMIT_ENABLE:
                    return PROP_LIMIT_ENABLE(arr[i])
                case BacnetPropertyIds.PROP_STATUS_FLAGS:
                    return PROP_STATUS_FLAGS(arr[i])
                case BacnetPropertyIds.PROP_ACK_REQUIRED:
                    return PROP_STATUS_FLAGS(arr[i])
                case BacnetPropertyIds.PROP_ACKED_TRANSITIONS:
                    return null;
                case BacnetPropertyIds.PROP_EVENT_TIME_STAMPS:
                    return null;
                default:
                    return PROP_OBJECT_TYPE(arr[i])
            }
        }
    }
    return null;
}


function PROP_OBJECT_IDENTIFIER(obj) {
    if (obj) {
        if (obj.value) {
            if (obj.value[0] != undefined) {
                if (obj.value[0].value != undefined) {
                    if (obj.value[0].value.instance) {
                        return obj.value[0].value.instance
                    }
                }
            }
        }
    }
    return null;
}
function PROP_EVENT_ENABLE(obj) {
    var res = PROP_OBJECT_TYPE(obj)
    if (res) {
        if (res.value) {
            if ((res.value[0] === undefined) == false) {
                return res.value[0]
            }
        }
    }
    return null
}
function PROP_LIMIT_ENABLE(obj) {
    return PROP_EVENT_ENABLE(obj)
}
function PROP_STATUS_FLAGS(obj) {
    return PROP_EVENT_ENABLE(obj)
}
function PROP_OBJECT_TYPE(obj) {
    if (obj) {
        if (obj.value) {
            if (obj.value[0]) {
                if (!(obj.value[0].value == undefined)) {
                    return obj.value[0].value;
                }
            }
        }
    }
    return null;
}
function PROP_OBJECT_NAME(obj) {
    return PROP_OBJECT_TYPE(obj);
}

function PROP_VENDOR_NAME(obj) {
    return PROP_OBJECT_TYPE(obj);
}

function PROP_MODEL_NAME(obj) {
    return PROP_OBJECT_TYPE(obj);
}


function PROP_OBJECT_LIST(obj) {
    if (obj) {
        if (obj.value) {
            return obj.value
        }
    }
    return null;
}

function PROP_SYSTEM_STATUS(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_VENDOR_IDENTIFIER(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_FIRMWARE_REVISION(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_APPLICATION_SOFTWARE_VERSION(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_PROTOCOL_VERSION(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_PROTOCOL_REVISION(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_PROTOCOL_SERVICES_SUPPORTED(obj) {//待修改
    var res = PROP_OBJECT_TYPE(obj);
    return "BitString:" + Bytes2Str(res.value)
}
function PROP_PROTOCOL_OBJECT_TYPES_SUPPORTED(obj) {//待修改
    return PROP_PROTOCOL_SERVICES_SUPPORTED(obj)
}
function PROP_MAX_APDU_LENGTH_ACCEPTED(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_SEGMENTATION_SUPPORTED(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_APDU_TIMEOUT(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_NUMBER_OF_APDU_RETRIES(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_DEVICE_ADDRESS_BINDING(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_DATABASE_REVISION(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_MAX_MASTER(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_MAX_INFO_FRAMES(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_DESCRIPTION(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_LOCAL_TIME(obj) {
    return dateFormat(PROP_OBJECT_TYPE(obj), "yyyy-mm-dd HH:MM:ss l")
}
function PROP_LOCAL_DATE(obj) {
    return dateFormat(PROP_OBJECT_TYPE(obj), "yyyy-mm-dd HH:MM:ss l")
}
function PROP_UTC_OFFSET(obj) {
    return PROP_OBJECT_TYPE(obj);
}

function PROP_DAYLIGHT_SAVINGS_STATUS(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_LOCATION(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_ACTIVE_COV_SUBSCRIPTIONS(obj) {
    return PROP_OBJECT_TYPE(obj);
}

function Bytes2Str(arr) {
    var str = "";
    for (var i = 0; i < arr.length; i++) {
        var tmp = arr[i].toString(16);
        if (tmp.length == 1) {
            tmp = "0" + tmp;
        }
        str += tmp.toUpperCase();
    }
    return str;
}
exports.searchProperty = searchProperty;