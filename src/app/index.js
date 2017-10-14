var fs = require("fs");
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
    label: 'QB BACnet Discovery Wizard...'
})
menu1.click = function () {
    Ext.Msg.alert("asda", "asda")
}
var menu2 = new nw.MenuItem({
    label: 'QB Modbus Configuration Wizard...',
})
var menu3 = new nw.MenuItem({
    label: 'About...'
})
menu3.click = function () {
    alert("SmartIO I1000 Quick Builder Tools")
}
submenu.append(menu1);
submenu.append(menu2);
submenu.append(menu3);
// Create and append the 1st level menu to the menubar
menu.append(new nw.MenuItem({
    label: 'First Menu',
    submenu: submenu
}));
// Assign it to `window.menu` to get the menu displayed
nw.Window.get().menu = menu;
