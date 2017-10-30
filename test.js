var fs = require('fs-extra')
var path = require("path");


class FileTree {
    constructor(path) {
        this.path = path;
        this.iterationFolder(path)
    }
    iterationFolder(path) {
        var self = this;
        var arr = []
        var files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var fpath = path + "/" + file;
            var info = fs.statSync(fpath);
            if (info.isDirectory()) {
                self.iterationFolder(fpath)

                arr.push({
                    'text': fpath,
                    'path': fpath,
                    'leaf': false,
                    'children': self.iterationFolder(fpath),
                    'allowDrop': false,
                    'allowDrag': false,
                    'expanded': true,
                })
            } else {
                arr.push({
                    'text': fpath,
                    'url': fpath,
                    'leaf': false,
                    'allowDrop': false,
                    'allowDrag': false,
                    'expanded': true,
                })
            }
        })
        return arr;
    }
}

var ft = new FileTree("src/app")