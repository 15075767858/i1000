var Cap = require('cap').Cap
//decoders = require('cap').decoders,
//POTOCOL = decoders.PROTOCOL;
var fs = require("fs-extra")
function InterfaceList() {
    console.log(JSON.stringify(Cap.deviceList()));
    return Cap.deviceList();
}
//InterfaceList()
function getInterfaceByIp(address) {
    var device = null;
    Cap.deviceList().forEach(function (v) {
        if (v.addresses[0].addr == address) {
            device = v;
        }
    })
    return device;
}
exports.getInterfaceByIp = getInterfaceByIp;
exports.deviceList = InterfaceList;
var path = require("path");
var jsonfile = require("jsonfile");
// var programPath = path.join(__dirname, "../WWW/program")
// if (path.extname(path.dirname(__dirname)) == ".asar") {
//     programPath = path.join(__dirname, "../../WWW/program")
// }
//var configFilePath = path.join(programPath, "resources/bacnetconfig.json");
var configFilePath = "C:/i1000/drive/bacnet/config.json"
function getBacnetConfig(config) {
    if (!fs.existsSync(configFilePath)) {
        fs.ensureFileSync(configFilePath);
        fs.writeFileSync(configFilePath, "{}")
    }
    try {
        if (config) {
            return jsonfile.readFileSync(configFilePath)[config]
        } else {
            return jsonfile.readFileSync(configFilePath)
        }
    } catch (err) {
        return {}
    }
}
exports.getBacnetConfig = getBacnetConfig;

function setBacnetConfig(name, value) {
    var obj = getBacnetConfig();
    if (typeof name == 'string') {
        obj[name] = value;
    } else {
        for (var propery in name) {
            obj[propery] = name[propery];
        }
    }
    jsonfile.writeFileSync(configFilePath, obj, { spaces: 2, EOL: '\r\n' });
    return obj;
}
exports.setBacnetConfig = setBacnetConfig;
exports.getBacnetTransport = function () {
    var config = getBacnetConfig()
    if (config.interfaceip) {
        var device = getInterfaceByIp(config.interfaceip);
        if (device) {
            if (device.addresses[0]) {
                if (config.BACnet_transport_port) {
                    device.addresses[0].port = config.BACnet_transport_port;
                }
                return device.addresses[0];
            }
        }
        return device;
    }
    return config
}

// { name: '\\Device\\NPF_{97D3D8DD-524A-4995-9AE7-1E9AB02C8A54}',
// description: 'Intel(R) 82579LM Gigabit Network Connection',
// addresses:
//  [ { addr: '192.168.253.5',
//      netmask: '255.255.255.0',
//      broadaddr: '255.255.255.255' } ] }