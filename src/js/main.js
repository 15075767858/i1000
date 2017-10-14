/**
 * Created by liuzhencai on 16/7/11.
 */

function centerConfig(xmlFile) {

    var treeStore = Ext.create("Ext.data.TreeStore", {
        root: {}
    })
    var root = getTreeRoot(xmlFile);

    function getTreeRoot(xmlFile) {
        var root;
        showXml(xmlFile, function (res) {
            var xml = $.parseXML(res)
            root = XmlToFrameJson(xml.childNodes[0])
        })
        return root
    }

    treeStore.setRootNode(root)
    var treePanel = Ext.create("Ext.tree.Panel", {
        region: "center",
        useArrows: true,
        animate: true,
        store: treeStore,
        checkPropagation: "both",
        bufferedRenderer: false,
        viewConfig: {
            plugins: {
                ptype: 'treeviewdragdrop',
                appendOnly: true,
                sortOnDrop: true,
                containerScroll: true
            }
        },
        tbar: [
            {
                text: 'Expand All',
                scope: this,
                handler: function (th) {
                    treePanel.expandAll()
                }
            }, {
                text: 'Collapse All',
                scope: this,
                handler: function (th) {
                    treePanel.collapseAll()
                }
            }, "->", {
                text: "refresh",
                handler: function () {
                    treeStore.setRootNode(getTreeRoot(xmlFile))
                }
            }
        ],
        listeners: {
            itemcontextmenu: function (node, record, item, index, e, eOpts) {
                e.stopEvent()
                console.log(arguments)
                Ext.create("Ext.menu.Menu", {
                    autoShow: true,
                    x: e.pageX,
                    y: e.pageY,
                    items: [
                        {
                            text: "Add Node", handler: function () {
                                record.set("leaf", false)
                                for (var i = 0; i < record.childNodes.length; i++) {
                                    if (record.childNodes[i].data.leaf == true) {
                                        record.childNodes[i].remove()
                                    }
                                }
                                record.appendChild({
                                    text: "new node",
                                    leaf: false
                                })
                            }
                        }, {
                            text: "Add Value", handler: function () {
                                record.removeAll();
                                record.appendChild({
                                    text: "default value",
                                    leaf: true
                                })
                            }
                        },
                        {
                            text: "Delete Node", handler: function () {
                                record.remove()
                            }
                        },
                        {
                            text: "Rename", handler: function () {
                                var tempWin = Ext.create("Ext.window.Window", {
                                    width: 300,
                                    bodyPadding: 10,
                                    title: "Set Node Parameter",
                                    layout: "auto",
                                    modal: true,
                                    autoShow: true,
                                    items: {
                                        xtype: "textfield",
                                        fieldLabel: "Input Node Info",
                                        value: record.data.text
                                    },
                                    buttons: [{
                                        text: "Ok",
                                        handler: function () {
                                            record.set("text", tempWin.items.items[0].value)
                                            tempWin.close()
                                        }
                                    }]
                                })
                            }
                        }
                    ]
                })
            }
        }
    })

    Ext.create("Ext.window.Window", {
        height: 800,
        width: 600,
        title: "center_config Config",
        autoShow: true,

        renderTo: Ext.getBody(),
        layout: "border",
        items: [treePanel],
        buttons: [{
            text: "Ok",
            handler: function (win) {
                var root = FrameJsonToXml(treePanel.getRootNode())
                var content = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n' + formatXml(root.outerHTML)
                saveXml(xmlFile, function () {
                    Ext.Msg.alert("Massage", "Ok!")
                }, content)
                win.close();
            }
        }],
        listeners: {
            close: function () {
                window.location.href = "index.html"
            }
        }
    })

}

function getRedisValue(ip, port, key, type) {
    var data = "";
    Ext.Ajax.request({
        url: "php/main.php",
        async: false,
        params: {
            par: "getNodeTypeValue",
            ip: ip,
            port: port,
            nodename: key,
            type: type
        },
        success: function (response) {
            data = response.responseText;
        }
    })
    return data;
}
function globalClick() {

    var IPCombo = Ext.create("Ext.form.field.Tag", {
        fieldLabel: "Sources IP",
        store: ['127.0.0.1', window.location.hostname, "192.168.253.253", "192.168.253.253"],
        labelWidth: 70,
        maxWidth: 300,
        createNewOnEnter: true,
        createNewOnBlur: true,
        filterPickList: true,
        queryMode: 'local',
        hideTrigger: false,
        listeners: {
            focus: function (field) {
                field.el.query(".x-tagfield-arialist")[0].style.display = 'none';
            }
        }
        //value: location.hostname
    });
    var PortCombo = Ext.create("Ext.form.field.ComboBox", {
        fieldLabel: "port number",
        store: ["6379"],
        value: "6379"
    });
    var formPanel = Ext.create("Ext.form.Panel", {
        region: "north",
        items: {
            xtype: "fieldset",
            title: "link option",
            layout: "hbox",
            defaults: {
                margin: 10
            },
            items: [
                IPCombo, PortCombo,
                {
                    xtype: "button",
                    text: "link",
                    handler: function () {
                        var treeStore = Ext.create("Ext.data.TreeStore", {
                            fields: ["text"],
                            proxy: {
                                type: "ajax",
                                autoLoad: true,
                                url: "php/globalTree.php?ip=" + IPCombo.value + "&port=" + PortCombo.value,
                                reader: {
                                    type: "json"
                                }
                            },
                            root: {
                                text: "root"
                            }
                        })

                        treePanel.setStore(treeStore);
                    }
                }
            ]
        }
    })
    var treePanel = Ext.create("Ext.tree.Panel", {
        region: "center",
        useArrows: true,
        animate: true,
        checkPropagation: "both",
        rootVisible: false,
        bufferedRenderer: false,
        tbar: [{
            text: 'Expand All',
            scope: this,
            handler: function (th) {
                treePanel.expandAll()
            }
        }, {
            text: 'Collapse All',
            scope: this,
            handler: function (th) {
                treePanel.collapseAll()
            }
        }, "->", {
            text: "config read time", handler: function () {
                //var xml =   loadXML("/mnt/nandflash/bac_config.xml")
                var xmlFile = "../../bac_config.xml";
                showXml(xmlFile, function (res) {
                    var xml = loadXML(res)
                    var readtime = xml.querySelector("read_time")
                    if (readtime) {
                        var value = readtime.innerHTML;
                    }
                    var win = Ext.create("Ext.window.Window", {
                        width: 300,
                        bodyPadding: 10,
                        title: "Config Read Time",
                        layout: "auto",
                        modal: true,
                        autoShow: true,
                        items: {
                            xtype: "textfield",
                            fieldLabel: "Read Time",
                            value: value || ""
                        },
                        buttons: [{
                            text: "Ok",
                            handler: function () {
                                if (readtime) {
                                    readtime.innerHTML = win.items.items[0].value
                                    var content = formatXml(xmlToStr(xml))
                                    saveXml(xmlFile, function () {
                                        Ext.Msg.alert("Massage", "Ok!")
                                    }, content)

                                } else {
                                    var root = document.createElement("root");
                                    var rootChildren = xml.querySelector("root").querySelectorAll("*")
                                    readtime = document.createElement("read_time")
                                    readtime.innerHTML = win.items.items[0].value
                                    root.appendChild(readtime);
                                    for (var i = 0; i < rootChildren.length; i++) {
                                        var tag = document.createElement(rootChildren[i].tagName);
                                        tag.innerHTML = rootChildren[i].innerHTML
                                        root.appendChild(tag)
                                    }
                                    var content = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n' + formatXml(root.outerHTML)
                                    saveXml(xmlFile, function () {
                                        Ext.Msg.alert("Massage", "Ok!")
                                    }, content)
                                }

                                win.close();
                            }
                        }]
                    })
                    console.log(xmlToStr(loadXML(res)))
                })
            }
        }]
    })

    Ext.create("Ext.window.Window", {
        height: 500,
        width: 700,
        title: "Export Global.xml",
        autoShow: true,
        renderTo: Ext.getBody(),
        layout: "border",
        items: [formPanel, treePanel],
        buttons: [
            {
                text: "Export Checked Point",
                handler: function () {

                    var win = Ext.create("Ext.window.Window", {
                        width: 300,
                        bodyPadding: 10,
                        title: "Link Option",
                        layout: "auto",
                        modal: true,
                        autoShow: true,
                        items: {
                            xtype: "combo",
                            fieldLabel: "Destination Ip",
                            store: [window.location.hostname, "192.168.253.253"],
                            value: window.location.hostname
                        },
                        buttons: [{
                            text: "Ok",
                            handler: function () {

                                var childNodes = treePanel.store.root.childNodes
                                //console.log(childNodes)
                                var checkeds = treePanel.getChecked();
                                var root = document.createElement("root");
                                for (var i = 0; i < childNodes.length; i++) {
                                    var device = document.createElement("device");
                                    device.setAttribute("ip", childNodes[i].data.text)
                                    device.setAttribute("address", "25")
                                    device.setAttribute("name", "");
                                    device.setAttribute("port", PortCombo.value);
                                    device.setAttribute("timeout", "1000");
                                    for (var j = 0; j < checkeds.length; j++) {
                                        if (checkeds[j].data.leaf) {
                                            var data = checkeds[j].parentNode.parentNode.parentNode.data;
                                            if (data.text == childNodes[i].data.text) {
                                                console.log(data)
                                                var point = document.createElement("point");
                                                point.setAttribute("key", checkeds[j].data.key)
                                                point.setAttribute("type", checkeds[j].data.key.substr(4, 1))
                                                device.appendChild(point)
                                            }
                                        }
                                    }
                                    root.appendChild(device)
                                    var remoteIp = win.down("combo").value.trim()
                                    var content = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n' + formatXml(root.outerHTML)
                                    console.log(content)
                                    if (remoteIp == location.hostname) {
                                        saveXml("../../global.xml", function () {
                                            Ext.Msg.alert("Massage", "Ok!")
                                        }, content)
                                        return
                                    } else {
                                        var form = $('<form method="post" action="http://' + remoteIp + '/php/xmlRW.php" >\
                                        <input name="rw" value="w">\
                                        <input name="fileName" value="../../global.xml">\
                                        <textarea name="content" type="textarea" value="' + content + '">\
                                        <input type="submit" value="提交">\
                                        </form>')
                                        form.submit()
                                    }
                                    /* var formPanel = Ext.create('Ext.form.Panel', {
                                     url:"http://"+remoteIp+"/php/xmlRW.php",
                                     renderTo:Ext.getBody(),
                                     method:"post",
                                     items: [
                                     {
                                     xtype:"textfield",
                                     name:"rw",
                                     value:'w',
                                     },
                                     {
                                     xtype: "textfield",
                                     name: "fileName",
                                     value: "../../global.xml"
                                     },
                                     {
                                     xtype: "textarea",
                                     name: "content",
                                     value: content
                                     }
                                     ],
                                     listeners:{
                                     boxready:function(){
                                     testForm =formPanel
                                     }
                                     }
                                     })*/

                                }


                                win.close();
                            }
                        }]
                    })


                }
            }
        ]

    })

}
/*

 var ip = win.items.items[0].getValue()
 console.log(ip)
 var checkeds = treePanel.getChecked();
 var root = document.createElement("root");
 var device = document.createElement("device");

 device.setAttribute("ip", IPCombo.value);
 device.setAttribute("address", "25")

 device.setAttribute("name", "");
 device.setAttribute("port", PortCombo.value);
 device.setAttribute("timeout", "1000");
 root.appendChild(device)
 checkeds.sort(function (a, b) {
 return a.data.text - b.data.text
 })

 for (var i = 0; i < checkeds.length; i++) {
 if (checkeds[i].data.leaf) {
 console.log(checkeds[i])
 var point = document.createElement("point");
 point.setAttribute("key", checkeds[i].data.text)
 point.setAttribute("type", checkeds[i].data.text.substr(4, 1))
 device.appendChild(point)
 }
 }
 var content = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n' + formatXml(root.outerHTML)

 */
