var fs = require("fs-extra");
const path = require('path');
var exec = require("child_process").exec
var xml2js = require('xml2js');
// 用来控制windows 文件树
class FileTree {
    constructor(filePath) {
        this.filePath = filePath;
        this.asyncView = false;//true 显示所有 false异步显示
        this.viewExtname = "*" //[".jpg",".xml"]
        //this.iterationFolder(path)
    }
    setAsyncView(boolean) {
        if (boolean != false)
            this.asyncView = boolean;
        return this;
    }
    setViewExtname(arr) {
        if (arr !== false) {
            this.viewExtname = arr;
        }
        return this;
    }
    showLetter(callback) {
        exec('wmic logicaldisk get caption', function (err, stdout, stderr) {
            if (err || stderr) {
                console.log("root path open failed" + err + stderr);
                return;
            }
            var letters = []
            var arr = stdout.split("\n")
            arr.forEach(function (value, index) {
                var isLetter = value.indexOf(":");
                if (isLetter >= 0) {
                    letters.push(value.substr(0, isLetter + 1))
                }
            })
            callback(letters);
        })
    }
    getRootLetter(callback) {
        this.showLetter(function (letters) {
            var arr = []
            letters.forEach(function (value) {
                arr.push({
                    'text': value,
                    'path': value + "/",
                    'leaf': false,
                    'children': [],
                    'allowDrop': false,
                    'allowDrag': false,
                    'expanded': false
                })
            })
            callback(arr);
        })
    }

    getTreeChilds(filePath) {
        var self = this;
        var arr = [];
        try {
            if (!fs.existsSync(filePath)) {
                return arr;
            }
            var files = fs.readdirSync(filePath);
            files.forEach(function (file, index) {
                var fpath = filePath + "/" + file;
                if (file == "System Volume Information") {
                    return
                }
                var info = fs.statSync(fpath);
                var filename = path.basename(fpath);
                if (info.isDirectory()) {
                    var childArr = []
                    if (self.asyncView) {
                        self.getTreeChilds(fpath)
                    }
                    arr.push({
                        'text': filename,
                        'path': fpath,
                        'leaf': false,
                        'children': childArr,
                        'allowDrop': false,
                        'allowDrag': false,
                        'expanded': false
                    })
                } else {
                    var extname = path.extname(filename)
                    arr.push({
                        'text': filename,
                        'path': fpath,
                        'leaf': true,
                        'allowDrop': false,
                        'allowDrag': false,
                        'expanded': true
                    })
                    if (self.viewExtname != "*") {
                        if (self.viewExtname.indexOf(extname) < 0) {
                            arr.pop()
                        }
                    }
                }
            })
        } catch (e) {
            return arr
        }
        return arr;
    }
    iterationFolder(filePath) {
        var self = this;
        var arr = []
        var files = fs.readdirSync(filePath);
        files.forEach(function (file, index) {
            var fpath = filePath + "/" + file;
            var info = fs.statSync(fpath);
            var filename = path.basename(fpath);
            if (info.isDirectory()) {
                self.iterationFolder(fpath)
                arr.push({
                    'text': filename,
                    'path': fpath,
                    'leaf': false,
                    'children': self.iterationFolder(fpath),
                    'allowDrop': false,
                    'allowDrag': false,
                    'expanded': false
                })
            } else {
                if (path.extname(filename) == ".xml") {
                    arr.push({
                        'text': filename,
                        'url': fpath,
                        'leaf': true,
                        'allowDrop': false,
                        'allowDrag': false,
                        'expanded': true
                    })
                }
            }
        })
        return arr;
    }
}

function getFileTree() {
    return new FileTree().getRootLetter(function (v) {
        console.log(v)
    })
}

function createFolder(fname) {
    fs.mkdirSync(fname)
}
function renameFile(oldPath, newPath) {
    return fs.renameSync(oldPath, path.dirname(oldPath) + "/" + newPath)
}
function loadProject(selectPath) {
    var projectPath = path.parse(selectPath);
    var projectInfo = fs.readJSONSync(selectPath);

    return { projectPath, projectInfo }
}
function loadBacnetXmlData(selectPath, callback) {
    xml2js.parseString(fs.readFileSync(selectPath + "/BACnetConfig.xml"), function (err, result) {
        if (err) {
            console.log(err)
            callback([])
        } else {
            var arr = []
            result.root.device.forEach(function (v) {
                arr = arr.concat(v.point)
            })
            callback(arr)
        }
    })
}

function createProject(location, projectName) {
    location = path.join(location, projectName)
    var p = path.format({ dir: location, name: projectName, ext: ".iqb" });
    fs.ensureDirSync(location + "/facilty");
    fs.writeJSONSync(p, {
        "project": projectName,
        "time": new Date()
    })
    return p;
}
function copyBacnetConfigXml(dest) {
    return fs.copySync("E:/mnt/nandflash/facilty/BACnetConfig.xml", dest + "/BACnetConfig.xml");
}
// new FileTree().setViewExtname([".iqb"]).getTreeChilds("F://").forEach(function(v){
//     console.log(v.text)
// })

exports.loadBacnetXmlData = loadBacnetXmlData

exports.copyBacnetConfigXml = copyBacnetConfigXml;
exports.createProject = createProject;
exports.loadProject = loadProject;
exports.renameFile = renameFile;
exports.createFolder = createFolder;
//console.log( fs.readdirSync("G://"))
exports.FileTree = FileTree;
// show  Windows letter
