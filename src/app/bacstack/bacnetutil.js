function searchProperty(arr, propertyIdentifier) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].propertyIdentifier == propertyIdentifier) {
            switch (propertyIdentifier) {
                case 77:
                    return read_Object_Name(arr[i]);
                case 121:
                    return read_VENDOR_NAME(arr[i])
                case 70:
                    return read_MODEL_NAME(arr[i])
                default:
                    return arr[i];
            }
        }
    }
    return null;
}

function read_Object_Name(obj) {
    if (obj) {
        if (obj.value[0]) {
            if (obj.value[0].value) {
                return obj.value[0].value
            }
        }
    }
    return null;
}

function read_VENDOR_NAME(obj) {
    return read_Object_Name(obj)
}

function read_MODEL_NAME(obj) {
    return read_Object_Name(obj)
}
exports.searchProperty = searchProperty;