// Create an empty menubar
var menu = new nw.Menu({
    type: 'menubar'
});
// Create a submenu as the 2nd level menu
var tools = new nw.Menu();
var bacnetConfig = new nw.MenuItem({
    label: 'BACnet Discovery Wizard...',
    click: function () {
        var win;
        if (win = Ext.getCmp("ConfigBACnet")) {
            win.show();
        } else {
            Ext.create("ConfigBACnet")
        }
    }
})
var modbusConfig = new nw.MenuItem({
    label: 'Modbus Configuration Wizard...',
})
var about = new nw.MenuItem({
    label: 'About...'
})
about.click = function () {
    alert("i1000 Quick builder ")
}
tools.append(bacnetConfig);
tools.append(modbusConfig);
tools.append(about);


// Create and append the 1st level menu to the menubar
menu.append(new nw.MenuItem({
    label: 'Menu',
    //submenu: submenu
}));
menu.append(new nw.MenuItem({
    label: 'Tools',
    submenu: tools
}));

// Assign it to `window.menu` to get the menu displayed
nw.Window.get().menu = menu;

