// Create an empty menubar


function getFileMenu() {
    var newMenu = new nw.MenuItem({
        label: 'New Project',
        click: function () {

            var projectWin = Ext.create("Ext.window.Window", {
                title: "new Project",
                autoShow: true,
                width: 340,
                height: 210,
                buttons: [{
                    text: "Ok",
                    handler: function () {
                        var projectName = projectWin.down("#projectName").getValue()
                        var location = projectWin.down("#location").getValue()
                        if (!!projectName & !!location) {
                            var npath = iFile.createProject(location, projectName);
                            projectWin.close()
                            Ext.Msg.alert("new project", "ok . " + location + "/" + projectName);
                            Ext.getCmp("mainPanel").loadProject(npath)
                        }
                    }
                }, {
                    text: "Cancel",
                    handler: function () {
                        projectWin.close()
                    }
                }
                ],
                items: {
                    margin: "10",
                    xtype: 'fieldset',
                    columnWidth: 0.5,
                    border: 0,
                    defaults: {
                        border: 0,
                        margin: "10 0 0 0"
                    },
                    items: [
                        {
                            fieldLabel: "Project Name",
                            xtype: "textfield",
                            itemId: "projectName",
                            allowBlank: false,
                        }, {
                            fieldLabel: "Location",
                            xtype: "textfield",
                            itemId: "location",
                            allowBlank: false,
                        }, {
                            text: "...",
                            xtype: "button",
                            handler: function () {
                                Ext.create("SelectFileWindow", {
                                    title: "Select Workspace",
                                    callback: function (select) {
                                        projectWin.down("#location").setValue(select[0].data.path)
                                        this.close();
                                    }
                                })
                            }
                        }
                    ]
                }
            })

        }
    })
    var openMenu = new nw.MenuItem({
        label: 'Open Workspace',
        click: function () {

            Ext.create("SelectFileWindow", {
                title: "Open Workspace",
                filePath: "",
                callback: function (select) {
                    var path = select[0].data.path;

                    Ext.getCmp("mainPanel").loadProject(path)
                    this.close()
                    //alert(JSON.stringify(iFile.loadProject(select[0].data.path)))
                }
            })

        }
    })
    var saveMenu = new nw.MenuItem({
        label: 'Graph',
        click: function () {

        }
    })
    var tools = new nw.Menu();
    tools.append(newMenu);
    tools.append(openMenu);
    //tools.append(saveMenu);
    return new nw.MenuItem({
        label: 'File',
        submenu: tools
    })
}

function getToolsMenu() {
    var downloadfile = new nw.MenuItem({
        label: 'Down Load File...',
        click: function () {
            Ext.create("BACnetDownLoadFile")
        }
    })
   
    var bacnetConfig = new nw.MenuItem({
        label: 'BACnet Discovery Wizard...',
        click: function () {
            if (!Ext.getCmp("mainPanel").isOpenProject) {
                Ext.Msg.alert("Message", "Please open a project first.")
                return;
            }
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
        label: 'About...',
        click: function () {
            alert("i1000 Quick builder 1.0.0")
        }
    })
    var tools = new nw.Menu();
    tools.append(downloadfile);
    tools.append(bacnetConfig);
    tools.append(modbusConfig);
    tools.append(about);
    return new nw.MenuItem({
        label: 'Tools',
        submenu: tools
    })
}

exports.getFileMenu = getFileMenu;
exports.getMainMenu = getMainMenu;
exports.getToolsMenu = getToolsMenu;



// var menu = new nw.Menu({
//     type: 'menubar'
// });
// menu.append(getFileMenu());
// menu.append(getMainMenu());
// menu.append(getToolsMenu());
// nw.Window.get().menu = menu;

function getMainMenu() {
    var localhref = location.href;
    var indexMenu = new nw.MenuItem({
        label: 'Home',
        click: function () {
            location.href = localhref
        }
    })
    var programMenu = new nw.MenuItem({
        label: 'program',
        click: function () {
            openIframeSrc("http://127.0.0.1/program")
        }
    })
    var graphMenu = new nw.MenuItem({
        label: 'Graph',
        click: function () {
            openIframeSrc("http://127.0.0.1/graph")
        }
    })

    var tools = new nw.Menu();
    tools.append(indexMenu);
    tools.append(programMenu);
    tools.append(graphMenu);
    return new nw.MenuItem({
        label: 'Menu',
        submenu: tools
    })
}