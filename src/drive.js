
const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
var fs = require("fs");
var bacnetconfig= require("./app/bacnetconfig")
//var svc= require("./app/svc");
//svc.install(process.argv0)
console.log(process.argv)
var server = require("./app/server")
try{
server.appRun(bacnetconfig.getBacnetConfig("i1000_port")||80)
}catch(err){
  fs.writeFileSync("error.text",err.message);
}
// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
  }
})
function createConfigWindow() {
  // 创建浏览器窗口。
  configwin = new BrowserWindow({ width: 630, height: 290 })
  // 然后加载应用的 index.html。
  //bacnetconfig.getBacnetConfig("i1000_port")

  configwin.setTitle("BACnet drive")
  var urlpath = url.format({
    pathname: path.join(__dirname, 'view/drive.html'),
    protocol: 'file:',
    slashes: true
  })
  configwin.loadURL(urlpath)

  configwin.show()
  
  //win.loadURL('https://www.w3cschool.cn');
  // 打开开发者工具。
  configwin.webContents.openDevTools()

  // 当 window 被关闭，这个事件会被触发。
  configwin.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    configwin = null
  })
}
app.on('ready', createConfigWindow)
app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
  }
})

// 在这文件，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。