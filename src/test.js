var child_process= require("child_process");
console.log(child_process.spawnSync("./node.exe",['"app/svc.js"',"install","install"]))