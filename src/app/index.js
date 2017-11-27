var fs = require("fs");
const path = require('path');
var iBACnet = require("../app/bacnet");
//var imenu = require("../app/menu");
var bacnetutil = require("../app/bacnetutil");
var iFile = require("../app/file");
var gui = require("nw.gui");
gui.App.clearCache()
var config;
const bacnetInterface = {
    iBACnet:iBACnet,
    bacnetutil:bacnetutil,
    iFile:iFile,
}
// var menu = new nw.Menu({
//     type: 'menubar'
// });
// menu.append(menu.getFileMenu());
// menu.append(menu.getMainMenu());
// menu.append(menu.getToolsMenu());
// nw.Window.get().menu = menu;
function openIframeSrc(src,callback) {
    var f;
    Ext.onReady(function () {
         f = document.getElementById("iframe")
        if (f) {
            f.src = src;
        } else {
            f = document.createElement("iframe");
            f.id = 'bodyframe'
            f.src = src;
            f.style.height = document.body.height;
            document.body.appendChild(f)
        }
        if (Ext.getCmp("mainPanel")){
            Ext.getCmp("mainPanel").hide()
        }
        callback(f)
    })
}
(function () {
    var runApp = gui.App.argv[0];
    //alert(runApp)
    //runApp = "program";
    if (runApp == "program") {
        var f = openIframeSrc("http://127.0.0.1/program#nopassword",function(){
            console.log(frames[0]);
            frames[0].parentWindow=window;
            frames[0].bacnetInterface=bacnetInterface;
            frames[0].deviceOnlinTreePanelReady=function(panel){
                alert("deviceOnlinTreePanelReady")
            }
        });
        document.title = "program edit";
    } else if (runApp == "graph") {
        openIframeSrc("http://127.0.0.1/graph#nopassword");
        document.title = "graph edit";
    } else {
        var menu = new nw.Menu({
            type: 'menubar'
        });
        menu.append(getFileMenu());
        menu.append(getToolsMenu());
        nw.Window.get().menu = menu;
        Ext.onReady(function () {
            Ext.create("MainPanel");
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

})()


// fs.readFile("json/config.json", function (err, buff) {
//     var str = buff.toString()
//     var data = JSON.parse(str);
//     config = data;
//     console.log(data)
// })
//console.log(getFileTree("F:/"))

