var xml2js = require('xml2js');
var fs = require("fs-extra");
var path = require("path")
let nodewindow = require('node-windows');

var i1000Path = "C:/i1000";
var daemonPath = path.join(i1000Path, "daemon");
var drivePath = path.join(i1000Path, "drive");
var logPath = path.join(i1000Path, "log.txt");
var driveXmlPath = path.join(daemonPath, "i1000drive.xml");
let Service = nodewindow.Service;
//svc.install();
//install("C:/i1000/drive.txt")
let svc = new Service({
  name: 'i1000drive',    //服务名称  
  description: 'i1000 drive', //描述  
  script: drivePath, //nodejs项目要启动的文件路径
});
//console.log(process.argv,"\n");
if (process.argv[2] == "install") {
  install(process.argv[3],(message)=>{
    console.log(message)
  });
} else if (process.argv[2] == "uninstall") {
  uninstall(function(message){
    console.log(message)
  });
}
function install(exePath, callback) {
  if (svc.exists) {
    if(callback){
      callback("Service has already existed .")
    }
  }else{
    svc.install()
    svc.on('install', () => {
      changeXmlPath(exePath);
      svc.start();
      if (callback) {
        callback("Service installation completion .")
      }
    });
  }
  
  if (!svc.exists) {
  }
}
function uninstall(callback) {
  if (!svc.exists) {
    if (callback) {
      callback("Uninstall was skipped because process does not exist or could not be found.")
    }
  } else {
    svc.uninstall()
    svc.on('uninstall', () => {
      if (callback) {
        callback("Uninstall complete.")
      }
    });
  }
}
function changeXmlPath(exePath) {
  fs.appendFileSync(logPath, "exePath " + exePath)
  var exeDir = path.dirname(exePath);
  if (!fs.existsSync(driveXmlPath)) {
    fs.appendFileSync(logPath, "xml don't exists .")
    return;
  }
  xml2js.parseString(fs.readFileSync(driveXmlPath), function (err, obj) {
    if (err) {
      fs.appendFileSync(logPath, err.message);
    }
    fs.appendFileSync(logPath, exePath + "\n");
    obj["service"]["executable"][0] = exePath;
    obj["service"]["workingdirectory"] = path.dirname(exePath);
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(obj);
    fs.writeFileSync(driveXmlPath, xml)
  })
}
exports.install = install;
exports.uninstall = uninstall;
