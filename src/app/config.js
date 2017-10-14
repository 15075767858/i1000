var jsonfile = require("jsonfile");
var file = "src/json/config.json"

function getServerPort() {
    var obj = jsonfile.readFileSync(file)
    console.log(obj)
    return obj['server-port'] || 2018
}

function getServerAddress() {
    var obj = jsonfile.readFileSync(file)
    return obj['server-address'] || "127.0.0.1"
}
var serverAddress = getServerAddress();
var serverPort = getServerPort();

exports.serverAddress = serverAddress;
exports.serverPort = serverPort;
exports.getServerPort = getServerPort;
exports.getServerAddress = getServerAddress;

// jsonfile.writeFileSync(file, obj, { spaces: 2, EOL: '\r\n' }, function (err) {
//     console.error(err)
// })