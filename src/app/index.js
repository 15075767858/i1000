var fs = require("fs");
var iBACnet = require("../app/bacnet");
var bacnetutil = require("../app/bacnetutil")

var config;
fs.readFile("json/config.json", function (err, buff) {
    var str = buff.toString()
    var data = JSON.parse(str);
    config = data;
    console.log(data)
})

// Create an empty menubar
var menu = new nw.Menu({
    type: 'menubar'
});
// Create a submenu as the 2nd level menu
var submenu = new nw.Menu();
var menu1 = new nw.MenuItem({
    label: 'BACnet Discovery Wizard...'
})

menu1.click = function () {
    var win;
    if (win = Ext.getCmp("ConfigBACnet")) {
        win.show();
    } else {
        Ext.create("ConfigBACnet")
    }
}
var menu2 = new nw.MenuItem({
    label: 'Modbus Configuration Wizard...',
})
var menu3 = new nw.MenuItem({
    label: 'About...'
})
menu3.click = function () {
    alert("i1000 Quick builder ")
}
submenu.append(menu1);
submenu.append(menu2);
submenu.append(menu3);
// Create and append the 1st level menu to the menubar
menu.append(new nw.MenuItem({
    label: 'Tools',
    submenu: submenu
}));
// Assign it to `window.menu` to get the menu displayed
nw.Window.get().menu = menu;
