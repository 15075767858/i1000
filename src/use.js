var fs = require("fs");
var path = require("path");
var packagePath = "F:\\i1000\\src\\package.json";
var packageprogram = "F:\\i1000\\src\\packageprogram.json";
var packagei1000 = "F:\\i1000\\src\\packagei1000.json";
var packagedrive = "F:\\i1000\\src\\packagedrive.json";
if (process.argv[2] == "program") {
    fs.writeFileSync(packagePath, fs.readFileSync(packageprogram))
} else if (process.argv[2] == "i1000") {
    fs.writeFileSync(packagePath, fs.readFileSync(packagei1000))
} else if (process.argv[2] == "drive") {
    fs.writeFileSync(packagePath, fs.readFileSync(packagedrive))
}
