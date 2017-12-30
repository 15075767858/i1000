var fs = require("fs");
if (process.argv[2] == "program") {
    fs.writeFileSync("package.json",fs.readFileSync("packageprogram.json"))
} else if (process.argv[2] == "i1000") {
    fs.writeFileSync("package.json",fs.readFileSync("packagei1000.json"))
} else if (process.argv[2] == "drive") {
    fs.writeFileSync("package.json",fs.readFileSync("packagedrive.json"))
}
