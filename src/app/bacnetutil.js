var bacnet = require('./bacstack/index');
var bacnetenum = require('./bacstack/index').enum;
var benum = require('./bacstack/lib/bacnet-enum');
var xmlbuilder = require("xmlbuilder");
var xml2js = require("xml2js");
var bacnetdevice = require("./bacnet-device")
var dateFormat = require('dateformat');
var fs = require('fs-extra')
var crc = require("./crc");
var path = require("path");
// checkUploadFile(1, "C:\\Users\\Administrator\\Desktop\\程序文件\\1001", '1063', function () {
//     console.log(arguments)
// })


// var device = { "npdu": { "len": 10, "funct": 40, "destination": { "type": 0, "net": 65535 }, "source": { "type": 0, "net": 1100, "adr": [63] }, "hopCount": 255, "networkMsgType": 0, "vendorId": 0 }, "address": "192.168.253.253", "deviceId": 1063, "maxApdu": 480, "segmentation": 0, "vendorId": 913, "net": 1100, "adr": 63, "id": "extModel63-1", "show": "Instance:1063 NET:1100 MAC:63" }
// writeFile(device, 2, true, "C:\\Users\\Administrator\\Desktop\\程序文件\\1033.xml",
//     function () {
//         console.log(arguments)
//     }
// )
//getDevicesToTreeData()
//获得 treepanel 的设备
function getDevicesToTreeData(callback) {
    getWhoIsData2(3000, function (err, devices, client) {
        if (devices) {
            devices.map(function (device) {
                device.id = device.deviceId;
                device.qtip = device.address + ":47808  Device Instance:" + device.deviceId + " Net:" + device.net + ", AddrLen:" + device.adrLen + ", MAC:" + device.adr;
                device.text = "Instance:" + device.deviceId + " Net:" + device.net + ",MAC:" + device.adr;
                device.leaf = false;
            })
        }
        callback(err, devices);
    })
}
//getObjectsToTreeData("1063")
function getObjectsToTreeData(device, propertyIdentifier, callback) {
    readPropertyMultiple(null, device, 8, device.deviceId, propertyIdentifier, null, function (err, result) {
        if (!err) {
            var resObj = [];
            for (var property in bacnetenum.BacnetPropertyIds) {
                var id = bacnetenum.BacnetPropertyIds[property];
                var res = searchProperty(result, id);
                if (!(res === undefined || res === null)) {
                    if (id == 76) {
                        res.forEach(function (item) {
                            console.log(item)
                            var objName = BacnetObjectTypeName(item.value.type);
                            var textInstance = ("00" + item.value.instance)
                            textInstance = "[" + textInstance.substr(textInstance.length - 3, textInstance.length) + "]"
                            if (item.value.type != 8) {
                                var text = objName.substr(7, property.length).toLowerCase() + "[" + id + "]" + ":" + textInstance;
                                resObj.push({
                                    objType: item.value.type,
                                    objValue: item.value.instance,
                                    text: text,
                                    sourcetext: text,
                                    id: objName + "_" + item.value.instance,
                                    isObject: true,
                                    leaf: false
                                })
                            }
                        })
                    } else {
                        resObj.push({
                            objType: property,
                            objValue: res,
                            text: property.substr(5, property.length).toLowerCase() + "[" + id + "]" + ":" + res,
                            id: id,
                            leaf: true
                        })
                    }

                }
            }
            callback(null, resObj);
        }
    })
}
exports.getObjectsToTreeData = getObjectsToTreeData;

// var device = { "npdu": { "len": 10, "funct": 40, "destination": { "type": 0, "net": 65535 }, "source": { "type": 0, "net": 1100, "adr": [63] }, "hopCount": 255, "networkMsgType": 0, "vendorId": 0 }, "address": "192.168.253.253", "deviceId": 1063, "maxApdu": 480, "segmentation": 0, "vendorId": 913, "net": 1100, "adr": 63, "id": "extModel63-1", "show": "Instance:1063 NET:1100 MAC:63" }
// getObjectsListToTreeData(device,function(){
//     console.log(arguments)
// })
function getObjectsListToTreeData(device, callback) {
    readPropertyMultiple(null, device, 8, device.deviceId, 76, null, function (err, result) {
        var resObj = [];
        for (var property in bacnetenum.BacnetPropertyIds) {
            var id = bacnetenum.BacnetPropertyIds[property];
            var res = searchProperty(result, id);
            if (!(res === undefined || res === null)) {
                if (id == 76) {
                    res.forEach(function (item) {
                        console.log(item)
                        var objName = BacnetObjectTypeName(item.value.type);
                        var textInstance = ("00" + item.value.instance)
                        textInstance = "[" + textInstance.substr(textInstance.length - 3, textInstance.length) + "]"
                        if (item.value.type != 8) {
                            var text = objName.substr(7, property.length).toLowerCase() + "[" + id + "]" + ":" + textInstance;
                            resObj.push({
                                objType: item.value.type,
                                objValue: item.value.instance,
                                text: text,
                                sourcetext: text,
                                id: objName + "_" + item.value.instance,
                                isObject: true,
                                leaf: false
                            })
                        }
                    })
                } else {
                    resObj.push({
                        objType: property,
                        objValue: res,
                        text: property.substr(5, property.length).toLowerCase() + "[" + id + "]" + ":" + res,
                        id: id,
                        leaf: true
                    })
                }

            }
        }
        callback(null, resObj);
    })
}
exports.getObjectsListToTreeData = getObjectsListToTreeData;
//var address = { address: '192.168.253.253', net: 1100, adr: [63] }
function readPropertyMultiple(client, address, objectType, instance, propertyIdentifier, propertyArrayIndex, callback) {
    var isHaveClient = true;
    if (!client) {
        isHaveClient = false;
        client = new bacnet({
            adpuTimeout: 10000,
            //interface:"192.168.22.22"
        })
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
    if (propertyArrayIndex != null & propertyArrayIndex != undefined) {
        requestArray[0].propertyReferences.propertyArrayIndex = propertyArrayIndex;
    }
    client.readPropertyMultiple(address, requestArray, function (err, result) {
        if (err) {
            readPropertyMultiple(client, address, objectType, instance, propertyIdentifier, callback)
        } else {
            callback(err, result)
            if (!isHaveClient) {
                client.close();
            }
        }
    });
}

//var address = { address: '192.168.253.253', net: 1100, adr: [63] }
//getObjectParsentValue(null, address, 0, 1, function () {  console.log(arguments)})
//获取ParsentValue
function getObjectParsentValue(client, address, objectType, instance, callback) {
    var isHaveClient = true;
    if (!client) {
        isHaveClient = false;
        client = new bacnet({
            adpuTimeout: 10000
        })
    }
    readObjectInfo(client, address, instance, objectType, bacnetenum.BacnetPropertyIds.PROP_PRESENT_VALUE, function (err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        var resObj = decodeBacnetObjectInfo(result)
        callback(null, resObj['PROP_PRESENT_VALUE'], result);
        if (!isHaveClient) {
            client.close();
        }
    })
}
exports.getObjectParsentValue = getObjectParsentValue;
var address = { address: '192.168.253.253', net: 1100, adr: [63] }

//105 80
// getObjListToTreeData(address, 1, 1, 105, function () {
//     console.log(arguments)
// })
//获取设备 AIAOBIBO..的所有属性
function getObjListToTreeData(device, objectType, instance, propertyIdentifier, callback) {
    readPropertyMultiple(null, device, objectType, instance, propertyIdentifier, null, function (err, result) {
        //readObjectInfoAll(null, address, instance, objectType, function (err, resData, result) {
        console.log(result)
        var resObj = [];
        for (var property in bacnetenum.BacnetPropertyIds) {
            var id = bacnetenum.BacnetPropertyIds[property];
            var res = searchProperty(result, id);
            if (!(res === undefined || res === null)) {
                resObj.push({
                    objType: property,
                    objValue: res,
                    text: property.substr(5, property.length).toLowerCase() + "[" + id + "]" + ":" + res,
                    id: id,
                    leaf: true
                })
            }
        }
        console.log(resObj)
        callback(null, resObj)
    })
}
exports.getObjListToTreeData = getObjListToTreeData;

//根据id获取 bacnet object type 的名称
function BacnetObjectTypeName(id) {
    for (var type in bacnetenum.BacnetObjectTypes) {
        if (bacnetenum.BacnetObjectTypes[type] == id) {
            return type
        }
    }
    return null;
}
exports.getDevicesToTreeData = getDevicesToTreeData;

//写入文件 功能入口 
function writeFile(device, instance, isCrc, filePath, callback) {
    var client = new bacnet({
        adpuTimeout: 10000
    })
    var address = device.address;
    if (device.npdu) {
        if (device.npdu.source) {
            address = {
                address: device.address,
                net: device.npdu.source.net,
                adr: device.npdu.source.adr
            };
        }
    }
    callback("start", 0);
    var fileBuffer = loadFile(filePath, isCrc);
    callback("load file and writeFile property", 0);
    writeFilePrperty(client, address, instance, fileBuffer, function (err, result) {
        callback("write File Property Success", 0)
        loopWriteFile(client, address, instance, fileBuffer, 0, 450, callback)
    })
}
exports.writeFile = writeFile;

function loadFile(filePath, isCrc) {
    var programFile = fs.readFileSync(filePath)
    if (isCrc) {
        programFile = crc.BufferCrc16(programFile)
    }
    return programFile
}

function loopWriteFile(client, address, instance, fileBuffer, position, count, callback) {
    var uploadBuffer = fileBuffer.slice(position * count, position * count + count);
    var progress = (position * count) / fileBuffer.length;
    if (progress >= 1) {
        callback("writing file ...", progress > 1 ? 1 : progress)
        client.close()
    }
    if (uploadBuffer.length > 0) {
        console.log(fileBuffer.length, uploadBuffer.length, position, count, position * count, position * count + count, uploadBuffer)
        client.writeFile(address, {
            type: 10,
            instance: instance
        }, position, uploadBuffer.length, uploadBuffer, function (err, value) {
            if (err) {
                loopWriteFile(client, address, instance, fileBuffer, position, count, callback)
                return
            } else {
                position++;
                loopWriteFile(client, address, instance, fileBuffer, position, count, callback)
            }
            console.log(err, value)
        })
    }
}

function writeFilePrperty(client, address, instance, fileBuffer, callback) {
    client.writeProperty(address, bacnetenum.BacnetObjectTypes.OBJECT_FILE,
        instance, //实例号
        bacnetenum.BacnetPropertyIds.PROP_FILE_SIZE,
        0, //优先级
        [{
            type: 2,
            value: fileBuffer.length
        }],
        function (err, value) {
            if (err) {
                writeFilePrperty(client, address, instance, fileBuffer, callback)
            } else {
                //console.log(programFile.slice(0, 450).toJSON())
                callback(err, value)
            }
        })
}

function checkUploadFile(fileInstance, filePath, deviceId, callback) {
    if (deviceId) {
        deviceId = deviceId + ""
    }
    switch (fileInstance - 0) {
        case 1:
            checkProgramFile(filePath, deviceId, callback);
            break;
        case 2:
            checkConfigFile(filePath, deviceId, callback);
            break;
        case 3:
            checkFirmwareFile(filePath, callback);
            break;
        default:
            return false;
    }
}

exports.checkUploadFile = checkUploadFile;

function checkProgramFile(filePath, deviceId, callback) {
    xml2js.parseString(fs.readFileSync(filePath), function (err, result) {
        if (err) {
            callback(err, false)
        }
        try {
            result.root.plant.every(function (plant) {
                return plant.master_node.every(function (master_node) {
                    if (typeof deviceId == "string" & typeof master_node.key != "undefined") {
                        console.log(deviceId, master_node.key)
                        if (master_node.key[0].substr(0, 4) !== deviceId) {
                            callback(new Error("The Selected File Instance is Incorrect! Current Device Instance:" + deviceId), false)
                            return false;
                        }
                        return true;
                    }
                    return true;
                })
            });

            callback(null, "The Selected File is Corrent! File Path is : <br> " + filePath, result);
        } catch (err) {
            callback(new Error("The Selected File is Incorrect! Please Check File!"), false);
        }
        //callback(err, result)
    })
}

function checkConfigFile(filePath, deviceId, callback) {
    xml2js.parseString(fs.readFileSync(filePath), function (err, result) {
        if (err) {
            callback(err, false)
            return
        }
        if (path.extname(filePath) != ".xml") {
            callback(new Error("The Selected File is Incorrect! Please Check File!"));
            return;
        }
        callback(null, "The Selected File is Corrent! File Path is : <br> " + filePath);
    })
}

function checkFirmwareFile(filePath, callback) {
    if (path.extname(filePath) != ".bin") {
        callback(new Error("The Selected File is Incorrect! Please Check File!"));
        return;
    }
    callback(null, "The Selected File is Corrent! File Path is : <br> " + filePath);
}

exports.bacnetdevice = bacnetdevice;
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
        callback(null, resData, client);
    }, adpuTimeout * (whoIsCount + 1))
    BACnetIAm(client, null, function (device) {
        if (device.npdu) {
            if (device.npdu.source) {
                if (device.npdu.source.net !== undefined) {
                    device.net = device.npdu.source.net;
                }
                if (device.npdu.source.adr !== undefined) {
                    device.adr = device.npdu.source.adr[0];
                    device.adrLen = device.npdu.source.adr.length;
                }
            }
        }
        client.timeSync(device.address, new Date(), true);
        resData.push(device)
    })
}
exports.getWhoIsData = getWhoIsData;
exports.getWhoIsData2 = getWhoIsData2;

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
        var xml = root.end({
            pretty: true
        }).toString()
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
        'OBJECT_TRENDLOG'
    ]


    console.log(Object_List)
    //bacnetenum.BacnetPropertyIds
}
// readObjectInfoAll(new bacnet(), { address: "192.168.253.253", net: "1100", adr: [63] }, "1063", 8, function () {
//     console.log(arguments)
// })
function readObjectInfoAll(client, address, instance, objectType, callback) {
    var isHaveClient = true;
    if (!client) {
        isHaveClient = false;
        client = new bacnet({
            adpuTimeout: 10000
        })
    }
    readObjectInfo(client, address, instance, objectType, bacnetenum.BacnetPropertyIds.PROP_ALL, function (err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        console.log(result)

        var resObj = decodeBacnetObjectInfo(result)

        callback(null, resObj, result);
        if (!isHaveClient) {
            client.close();
        }
    })
}
function decodeBacnetObjectInfo(result) {
    var resObj = {}
    for (var property in bacnetenum.BacnetPropertyIds) {
        var id = bacnetenum.BacnetPropertyIds[property];
        var res = searchProperty(result, id)
        if (!(res === undefined || res === null)) {
            resObj[property] = res
        }
    }
    return resObj;
}

exports.readObjectInfoAll = readObjectInfoAll;

function readObjectInfo(client, device, instance, objectType, propertyIdentifier, callback) {
    var address = device.address;
    if (device.npdu) {
        if (device.npdu.source) {
            address = {
                address: device.address,
                net: device.npdu.source.net,
                adr: device.npdu.source.adr
            };
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

function PROP_PROTOCOL_SERVICES_SUPPORTED(obj) { //待修改
    var res = PROP_OBJECT_TYPE(obj);
    return "BitString:" + Bytes2Str(res.value)
}

function PROP_PROTOCOL_OBJECT_TYPES_SUPPORTED(obj) { //待修改
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