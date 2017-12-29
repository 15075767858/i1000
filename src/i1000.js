const { app, BrowserWindow, Menu, Tray } = require('electron')
var AutoLaunch = require('auto-launch');
var os = require("os")
const path = require('path')
const url = require('url')
var server = require("./app/server");
var fs = require("fs");
let tray = null
var serverPort = 80;

copyThisToStart()
function copyThisToStart() {
  var homedir = os.userInfo().homedir;
  var sourceFile = process.argv[0];
  var targetFile = path.join(homedir, "AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup/i1000.exe")
  fs.unlinkSync(targetFile);
  fs.symlinkSync(sourceFile, targetFile);
}
// let Service = require('node-windows').Service;  
// let svc = new Service({  
//   name: 'i1000',    //服务名称  
//   description: 'i1000Server', //描述  
//   script: 'run.bat' //nodejs项目要启动的文件路径  
// });
// svc.on('install', () => {  
//   svc.start();  
// });
// svc.install();


console.log(process.argv)

// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let win;
let configwin;
function createConfigWindow() {
  // 创建浏览器窗口。
  configwin = new BrowserWindow({ width: 630, height: 290 })
  // 然后加载应用的 index.html。
  //bacnetconfig.getBacnetConfig("i1000_port")
  var urlpath = url.format({
    pathname: path.join(__dirname, 'view/config.html'),
    protocol: 'file:',
    slashes: true,
    query: { serverPort: serverPort }
  })
  configwin.setTitle("BACnet Config");
  console.log(urlpath)
  configwin.loadURL(urlpath)
  configwin.show()
  
  //win.loadURL('https://www.w3cschool.cn');
  // 打开开发者工具。
  //win.webContents.openDevTools()

  // 当 window 被关闭，这个事件会被触发。
  configwin.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    configwin = null
  })
}
function createWindow() {


  // 创建浏览器窗口。
  win = new BrowserWindow({ width: 1024, height: 768 })
  // 然后加载应用的 index.html。
  var urlpath = url.format({
    pathname: path.join(__dirname, 'view/i1000.html'),
    protocol: 'file:',
    slashes: true,
    query: { serverPort: serverPort }
  })
  win.setTitle(`i1000 [port=${serverPort}]`)
  console.log(urlpath)
  win.loadURL(urlpath)
  win.show()

  //win.loadURL('https://www.w3cschool.cn');
  // 打开开发者工具。
  //win.webContents.openDevTools()

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null
  })
}
function appReady() {
  tray = new Tray(__dirname + '/assets/i1000.ico');
  server.appRun(undefined, function (port) {
    serverPort = port;
  })
  tray.on('double-click', () => {
    //createWindow()
    if (win)
      win.isVisible() ? win.hide() : win.show()
  })
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'i1000', type: 'normal', click: function () {
        createWindow()
      }
    },
    {
      label: 'config', type: 'normal', click: function () {
        createConfigWindow()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit', type: 'normal', click: function () {
        app.quit()
      }
    }
  ])
  tray.setToolTip('i1000 Server')
  tray.setContextMenu(contextMenu)
}
// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', appReady)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    //app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})

// 在这文件，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。