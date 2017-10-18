var bacnetenum = require('./bacstack/index').enum;
var benum = require('./bacstack/lib/bacnet-enum');
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
function BACnetIAm(client, deviceId, callback) {
    var devices = [];
    client.whoIs()
    client.on('iAm', function (device) {
        
        if (devices.indexOf(device.deviceId) < 0) {
            devices.push(device.deviceId);
            if (!deviceId) {
                
                callback(device);
            } else if (device.deviceId == deviceId) {
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
    console.log(Object_List, resArr)

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
    return PROP_OBJECT_TYPE(obj);
}
function PROP_PROTOCOL_OBJECT_TYPES_SUPPORTED(obj) {//待修改
    return PROP_OBJECT_TYPE(obj);
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
    return PROP_OBJECT_TYPE(obj);
}
function PROP_UTC_OFFSET(obj) {
    return PROP_OBJECT_TYPE(obj);
}
function PROP_LOCAL_DATE(obj) {
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

exports.searchProperty = searchProperty;