var child_process = require("child_process")
var ls = child_process.spawn("node", ['src/app/server.js'])

ls.stdout.on('data', (data) => {
    var arr = data.toString().split(" ");;
    if (arr[0] == "serverport") {
        console.log(arr[1])
    }
    console.log(`stdout: ${data}`);
});

// var fs = require("fs");
// var path = require("path");
// function runApp(callback) {
//     var portFile = path.join(__dirname, "port.text");
//     console.log(portFile)
//     //if (fs.existsSync(portFile)) {
//     //}
//     fs.unlink(portFile, function (err) {
//         //console.log(arguments)
//     })
//     fs.readFileSync()
// }
//runApp()

// child_process.exec("node src/app/server.js", function (err, stdout, stderr) {
//     console.log(arguments)
// })