
let Service = require('node-windows').Service;

let svc = new Service({
  name: 'i1000',    //服务名称  
  description: 'i1000Server', //描述  
  script: 'F:/program edit/src/run.js', //nodejs项目要启动的文件路径
  //wait: 2,
  //grow: .5  
});
svc.on('install', () => {
  console.log(arguments)
  svc.start();
});
svc.install();
//svc.uninstall();
// setTimeout(function () {
//   svc.uninstall();
// }, 3000)
