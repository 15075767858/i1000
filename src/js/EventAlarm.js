/**
 * Created by liuzhencai on 2016/12/19.
 */
/*  var mm = new MonitorModel()
 mm.save({
 failure: function (record, operation) {
 console.log(arguments)
 // do something if the save failed
 },
 success: function (record, operation) {
 console.log(arguments)

 // do something if the save succeeded
 },
 callback: function (record, operation, success) {
 console.log(arguments)

 // do something whether the save succeeded or failed
 }
 })*/
Ext.onReady(function () {

    var EventRootUrl = "/"
    var EventAlarmUrl = EventRootUrl + "graph/resources/EventAlarm.php"
    Ext.define("MonitorModel", {
        extend: "Ext.data.Model",
        fields: [
            {
                name: "ip", type: "string", defaultValue: location.host
            }, {
                name: "port", type: "int", defaultValue: "6379"
            }, {
                name: "key", type: "string"
            }, {
                name: "objectname", type: "string"
            },
            /*{
             name: "presentvalue", type: "string"
             },*/
            {
                name: "alarmtxt", type: "string", defaultValue: "ararmtxt"
            }, {
                name: "normaltxt", type: "string", defaultValue: "normaltxt"
            }
        ],

        getPresentValue: function () {
            var __this = this;
            Ext.Ajax.request({
                url: EventAlarmUrl,
                params: {
                    par: "gettypevalue",
                    ip: __this.get("ip"),
                    port: __this.get("port"),
                    nodename: __this.get("key"),
                    type: "Present_Value"
                }
            }).then(function (response) {
                //console.log(response)
                if (response.status == 200) {
                    __this.set("presentvalue", response.responseText);
                } else {
                    __this.set("presentvalue", "unlink")
                }
            })
        },
        getObjcetName: function () {
            var __this = this;
            //console.log(__this.getValidation())
            Ext.Ajax.request({
                url: EventAlarmUrl,
                params: {
                    par: "gettypevalue",
                    ip: __this.get("ip"),
                    port: __this.get("port"),
                    nodename: __this.get("key"),
                    type: "Object_Name"
                }
            }).then(function (response) {
                //console.log(response)
                if (response.status == 200) {
                    __this.set("objectname", response.responseText);
                } else {
                    __this.set("objectname", "unlink")
                }
            })
        },
        validators: {
            ip: {
                type: "format",
                matcher: /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/
            },
            port: {
                type: "format",
                matcher: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/
            },
            key: {type: "length", min: "7", max: "7"}
        },
        proxy: {
            type: 'ajax',
            url: '/test.php'
        },
    })


    Ext.define("AddMonitor", {
        extend: "Ext.window.Window",
        title: "Add Monitor",
        autoShow: true,
        initComponent: function () {
            var me = this;
            me.buttons = [
                {
                    text: "Ok", handler: function () {
                    var form = me.down("form")
                    console.log(form.getValues())
                    var mm = Ext.create("MonitorModel", form.getValues())
                    if (form.isValid()) {
                        me.callback(mm);
                    } else {
                        Ext.Msg.alert("Massage", "valid")
                    }
                }
                },
                {
                    text: "Close", handler: function () {
                    me.close();
                }
                }
            ];
            me.callParent()
        },
        items: {
            xtype: "form",

            defaults: {
                margin: 10
            },
            scrollable: "y",

            listeners: {
                boxready: function (form) {
                    var mm = Ext.create("MonitorModel")
                    form.loadRecord(mm)
                }
            },

            items: [
                {
                    xtype: "combo",
                    name: "ip",
                    store: ["192.168.253.253", location.host],
                    allowBlank: false,
                    regex: /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/,
                    fieldLabel: "ip"
                },
                {
                    xtype: "combo",
                    name: "port",
                    store: ["6379"],
                    allowBlank: false,
                    regex: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                    fieldLabel: "port"
                },
                {
                    xtype: "combo", name: "key", fieldLabel: "key", allowBlank: false, listeners: {
                    focus: function (field) {
                        console.log(arguments)
                        var values = field.up("form").getValues();
                        var id = "SelectKeyWinodw" + field.id
                        var component = Ext.getCmp(id)
                        if (component) {
                            return
                        }
                        var selectKeyWin = Ext.create("SelectKeyWinodw", {
                            id: id,
                            ip: values.ip,
                            port: values.port,
                            key: field.value,
                            callback: function (models) {
                                var objectname = models[0].get("text");
                                var key = models[0].get("value");
                                console.log(objectname, key)
                                field.setValue(key);
                                field.up().getComponent("objectname").setValue(objectname)
                                selectKeyWin.close();
                            }
                        })
                    }
                }
                },
                {
                    xtype: "textfield",
                    itemId: "objectname",
                    fieldLabel: "object name",
                    editable: false,
                    name: "objectname"
                },
                {xtype: "textfield", name: "alarmtxt", fieldLabel: "alarmtxt"},
                {xtype: "textfield", name: "normaltxt", fieldLabel: "normaltxt"},
            ],
        }
    })

    Ext.define("SelectKeyWinodw", {
        extend: "Ext.window.Window",
        title: "Select Key",
        autoShow: true,
        width: 600,
        maxHeight: 390,
        scrollable: "y",
        listeners: {
            boxready: function () {
                console.log(arguments)
            }
        },
        initComponent: function () {
            var me = this;
            me.items = [{
                rootVisible: false,
                xtype: "treepanel",
                listeners: {
                    boxready: function (treePanel) {
                        setTimeout(function () {

                            var node = treePanel.store.findNode('value', me.key)
                            if (node) {
                                var path = node.getPath()
                                treePanel.selectPath(path)
                            }
                        }, 1000)
                    }
                },
                tbar: [
                    {
                        text: 'Expand All',
                        xtype: "button",
                        handler: function (th) {
                            var me = this.up("treepanel");
                            me.expandAll();
                        }
                    }, {
                        text: 'Collapse All',
                        xtype: "button",
                        handler: function (th) {
                            var me = this.up("treepanel");
                            me.collapseAll();
                        }
                    }
                ],
                width: "100%",
                height: "100%",
                scrollable: "y",
                modal: true,
                store: Ext.create("Ext.data.TreeStore", {
                    autoLoad: true,
                    url: EventRootUrl + "graph/resources/main.php?par=nodes",
                    proxy: {
                        type: "ajax",
                        url: EventRootUrl + "graph/resources/main.php?par=nodes&ip=" + me.ip + "&port=" + me.port + "",
                        reader: {
                            type: "json"
                        }
                    }
                })
            }]
            me.buttons = [{
                text: "Ok",
                handler: function () {
                    //var grid = win.down("treepanel");
                    var tree = me.down("treepanel")
                    var selectArr = tree.getSelection();
                    console.log(selectArr)
                    if (!selectArr[0]) {
                        Ext.Msg.alert("Massage", "Please select a key .");

                    } else {
                        me.callback(selectArr)
                    }
                }
            }, {
                text: "Cancel",
                handler: function () {
                    me.close();
                }
            }]
            me.callParent();
        }
    })


    Ext.define("EventAlarmSetting", {
        extend: "Ext.window.Window",
        autoShow: true,
        collapsible: true,
        title: "Event Alarm Setting",
        width: 600,
        layout: "auto",
        initComponent: function () {
            var me = this;

            var grid = Ext.create("Ext.grid.Panel", {
                height: 390,
                maxHeight: 390,
                scrollable: "y",

                listeners: {
                    boxready: function () {
                        grid.features[0].expandAll();
                    }
                },
                saveXml: function () {
                    var store = grid.store;
                    var root = document.createElement("root")

                    for (var i = 0; i < store.data.length; i++) {
                        root.appendChild(jsonToXml(store.getAt(i).data))
                    }
                    function jsonToXml(json) {
                        var item = document.createElement("item");
                        item.id = json.id
                        var ip = document.createElement("ip");
                        ip.innerHTML = json.ip;
                        item.appendChild(ip)
                        var port = document.createElement("port");
                        port.innerHTML = json.port;
                        item.appendChild(port)
                        var key = document.createElement("key");
                        key.innerHTML = json.key;
                        item.appendChild(key)
                        var objectname = document.createElement("objectname");
                        objectname.innerHTML = json.objectname;
                        item.appendChild(objectname)
                        var alarmtxt = document.createElement("alarmtxt");
                        alarmtxt.innerHTML = json.alarmtxt;
                        item.appendChild(alarmtxt)
                        var normaltxt = document.createElement("normaltxt");
                        normaltxt.innerHTML = json.normaltxt;
                        item.appendChild(normaltxt)
                        /*var presentvalue = document.createElement("presentvalue");
                         presentvalue.innerHTML = json.presentvalue;
                         item.appendChild(presentvalue)*/
                        return item
                    }

                    var xmlstr = '<?xml version="1.0" encoding="UTF-8"?>' + "\r\n" + root.outerHTML;
                    Ext.Ajax.request({
                        url: EventAlarmUrl,
                        params: {
                            par: "saveAlarmconfXml",
                            content: xmlstr
                        }
                    }).then(function (response) {
                        var responseText = response.responseText;
                        if (responseText == xmlstr.length) {
                            Ext.Msg.alert("Massage", "save ok . " + responseText);

                            Ext.Ajax.request({
                                url: EventAlarmUrl + "?par=saveAlarmhisJson"
                            })

                        } else {
                            Ext.Msg.alert("Massage", "Error" + responseText)
                            Ext.Ajax.request({
                                url: EventAlarmUrl + "?par=saveAlarmhisJson"
                            })
                        }

                    })
                },
                buttons: [
                    {
                        text: "Ok", handler: function () {


                        grid.saveXml()
                    }
                    },
                    {
                        text: "close", handler: function () {
                        me.close()
                    }
                    }
                ],
                store: Ext.create("Ext.data.XmlStore", {
                    autoLoad: true,
                    groupField: 'ip',
                    model: Ext.create("MonitorModel"),
                    //fields: [{name: "id", mapping: "@id"}, "ip", "key", "alarmtxt", "normaltxt"],
                    idPath: 'ASIN',
                    proxy: {
                        type: 'ajax',
                        url: EventAlarmUrl + "?par=getAlarmconfXml",
                        reader: {
                            type: 'xml',
                            record: "item",
                            rootProperty: "root"
                        }
                    }, listeners: {
                        load: function (store, records, successful, operation, eOpts) {
                            //console.log("load", arguments)
                            this.fireEvent("change", store, records)
                        },
                        add: function (store, records, index, eOpts) {
                            //console.log("add", arguments)
                            this.fireEvent("change", store, records)

                        },

                        change: function (store, records) {
                            //console.log("change", arguments)

                            for (var i = 0; i < records.length; i++) {
                                //console.log(records[i])
                                records[i].getObjcetName()
                                records[i].getPresentValue()
                            }
                            console.log(records)
                        }
                    }
                }),
                features: new Ext.grid.feature.Grouping({
                    //groupHeaderTpl: '{name}{renderedGroupValue} &nbsp;&nbsp;({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})',
                    groupHeaderTpl: '{renderedGroupValue} &nbsp;&nbsp;({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})',
                    hideGroupedHeader: true,
                    startCollapsed: false
                }),
                tbar: [
                    {
                        text: 'Expand All',
                        handler: function () {
                            var me = this.up("gridpanel");
                            me.features[0].expandAll();
                        }
                    }, {
                        text: 'Collapse All',
                        handler: function () {
                            var me = this.up("gridpanel");
                            me.features[0].collapseAll();
                        }
                    }, "->", {
                        text: "Add Monitor",
                        handler: function () {
                            Ext.create("AddMonitor", {
                                callback: function (model) {
                                    grid.store.add(model)
                                    teststore = grid.store;
                                    Ext.Msg.alert("Massage", "ok , add Monitor")
                                }
                            })
                        }
                    }, {
                        text: "Delete Monitor",
                        handler: function () {
                            var selectModels = grid.getSelection();
                            if (selectModels[0]) {
                                grid.store.remove(selectModels[0])
                            }
                        }
                    }],
                columnLines: true,
                rowLines: true,
                plugins: {
                    ptype: 'rowediting',
                    clicksToEdit: 1,
                    listeners: {
                        edit: function (edit, context, eOpts) {

                        }
                    }
                },
                selModel: 'rowmodel',
                columns: [
                    {
                        text: 'ip', dataIndex: 'ip', hidden: true
                    },
                    {
                        text: 'key', dataIndex: 'key', flex: 1
                    },

                    {
                        text: 'alarmtxt', editable: true, dataIndex: 'alarmtxt', flex: 1, editor: {
                        xtype: 'textfield'
                    }
                    },
                    {
                        text: 'normaltxt', editable: true, dataIndex: 'normaltxt', flex: 1, editor: {
                        xtype: 'textfield'
                    }
                    },
                    {
                        text: "object name", dataIndex: "objectname", flex: 1
                    }
                ]
            })

            me.items = [grid]

            me.callParent();
        },
        listeners: {
            boxready: function (window) {
                setTimeout(function () {
                    window.collapse()
                }, 1000)
            },
            collapse: function (window) {
                window.setPosition(0, 0, true)
            }
        }
    })

    Ext.define("ListenModel", {
        extend: "Ext.data.Model",
        fields: [
            {name: "ip", type: "string"},
            {name: "port", type: "string"},
            {name: "key", type: "string"},
            {name: "objectname", type: "string"},
            {name: "presentvalue", type: "string"},
            {name: "alarmtxt", type: "string"},
            {name: "normaltxt", type: "string"},
            {
                name: "time", type: "int"
            }
        ],
        proxy: {
            type: 'post',
            url: EventAlarmUrl + "?par=addLog"
        }
    })


    Ext.define("ListenGrid", {
        extend: "Ext.grid.Panel",
        height: 400,
        maxHeight: 400,
        initComponent: function () {
            var me = this;
            me.initStore()
            me.audioInit();
            me.callParent()
            me.runListen();
        },
        initStore: function () {
            var me = this
            me.store = Ext.create("Ext.data.XmlStore", {
                model: Ext.create("ListenModel"),
                autoLoad: true,
                sorters: [
                    {
                        property: 'time',
                        direction: 'DESC'
                    }
                ],
                proxy: {
                    type: 'ajax',
                    url: EventAlarmUrl + "?par=getAlarmhisXml",
                    reader: {
                        type: 'xml',
                        record: "log",
                        rootProperty: "logs"
                    }
                },
                listeners: {
                    add: function () {
                        me.playAlarm()
                        me.up("window").show()
                        console.log(this)
                        console.log(arguments)
                    }
                }
            })
        },
        tbar: [
            {
                text: "STOP", icon: EventRootUrl + "graph/resources/icons/alarm_24px.png", handler: function (button) {
                button.up("grid").pauseAlarm()
            }
            }, "->"
            , {
                text: "Event Alarm Setting", handler: function () {
                    Ext.create("EventAlarmSetting")
                }
            }
        ],
        listeners: {
            boxready: function (grid) {
            }
        },

        runListen: function () {
            var me = this;
            setInterval(function () {
                me.getDiffJson()
            }, 3000)
        },
        getDiffJson: function () {
            var me = this;
            me.getAlarmconfJson(function (oldArr) {

                me.saveAlarmhisJsonfunction(function (length) {

                    me.getAlarmconfJson(function (newArr) {
                        var diffArr = [];
                        for (var i = 0; i < oldArr.length; i++) {
                            newArr.find(function (json, index) {
                                if (json.ip == oldArr[i].ip & json.port == oldArr[i].port & json.key == oldArr[i].key & json.presentvalue != oldArr[i].presentvalue) {
                                    diffArr.push(json);
                                    console.log(json)
                                }
                            })
                        }
                        if (diffArr.length > 0) {
                            console.log(diffArr)
                            me.addListenModels(diffArr)
                        }
                        console.log(diffArr)
                    })
                })
            })
        },
        addListenModels: function (arr) {
            var me = this;
            for (var i = 0; i < arr.length; i++) {
                me.addListenModel(arr[i])
            }
        },
        addListenModel: function (json) {
            var me = this;
            json.time = new Date().getTime();
            var lm = Ext.create("ListenModel", json);
            Ext.Ajax.request({
                url: EventAlarmUrl + "?par=addLog",
                params: json
            }).then(function (response) {
                console.log(response);
                try {
                    var resJson = Ext.decode(response.responseText);
                    me.store.insert(0, lm)
                } catch (e) {
                    Ext.Msg.alert("Maasage", e)
                }
            })
            /*lm.save({
             callback: function (record, operation, success) {
             if (success) {
             me.store.insert(0, lm)
             //me.playAlarm();
             } else {
             Ext.Msg.alert("Maasage", operation.error)
             }
             console.log(arguments)
             // do something whether the save succeeded or failed
             }
             })*/
        },
        saveAlarmhisJsonfunction: function (success) {
            Ext.Ajax.request({
                url: EventAlarmUrl,
                params: {
                    par: "saveAlarmhisJson"
                }
            }).then(function (response) {
                success(response.responseText)
            })
        },
        getAlarmconfJson: function (success) {
            var me = this;
            Ext.Ajax.request({
                url: EventRootUrl + "graph/alarmconf.json",
            }).then(function (response) {
                try {
                    var resArr = Ext.decode(response.responseText);
                    if (response.status == 200) {
                        success(resArr);
                    }
                } catch (e) {
                    console.log(e)
                    Ext.Msg.alert("Error", e)
                }
            })
        },
        columns: [
            {text: "ip", dataIndex: "ip", flex: 1},
            {text: "port", dataIndex: "port", flex: 1},
            {text: "key", dataIndex: "key", flex: 1},
            {text: "object name", dataIndex: "objectname", flex: 1},
            {text: "present value", dataIndex: "presentvalue", flex: 1},
            {
                text: "time", dataIndex: "time", flex: 2, renderer: function (v) {
                return new Date(v).toLocaleString()
            }
            }
        ],
        audioInit: function () {
            /*<audio id="audio">
             <source src="http://ossweb-img.qq.com/images/lol/m/act/a20160315live/shake_sound_male.mp3" type="audio/mpeg">
             Your browser does not support the audio tag.
             </audio>*/
            var me = this;
            var alarmAudio = document.createElement("audio");
            var alarmSource = document.createElement("source");
            alarmAudio.id = "alarmAudio";
            alarmSource.src = EventRootUrl + "resources/audio/alarm.mp3";
            alarmSource.type = "audio/mpeg"
            alarmAudio.appendChild(alarmSource);
            alarmAudio.loop = true;
            document.body.appendChild(alarmAudio);
            me.alarmAudio = alarmAudio;
            var eventAudio = document.createElement("audio")
            eventAudio.id = "eventAudio";
            eventAudio.src = EventRootUrl + "resources/audio/event.mp3";
            eventAudio.loop = true;
            document.body.appendChild(eventAudio);
            me.eventAudio = eventAudio;
        },
        playAlarm: function () {
            this.alarmAudio.play()
        },
        pauseAlarm: function () {
            this.alarmAudio.pause()
        },
        playEvent: function () {
            this.eventAudio.play()
        },
        pauseEvent: function () {
            this.alarmAudio.pause()
        },
    })

    Ext.define("ListenEventAlarm", {

        extend: "Ext.window.Window",
        collapsible: true,
        autoShow: true,
        title: "Listen Event Alarm",
        width: 800,
        y: 100,
        initComponent: function () {
            var me = this;
            me.initItemsListen()
            me.callParent();
        },
        initItemsListen: function () {
            var me = this;
            var form = Ext.create("Ext.form.Panel", {
                layout: "hbox",
                viewModel: Ext.create("Ext.app.ViewModel", {}),
                url: EventAlarmUrl + "?par=setSaveTime",
                items: [
                    {
                        xtype: 'fieldcontainer',
                        fieldLabel: 'alarmhis.xml',
                        defaultType: 'radiofield',
                        padding: 10,
                        defaults: {
                            flex: 1,
                            margin: "0 10 0 10"
                        },
                        layout: 'hbox',
                        items: [
                            {
                                xtype: "radiofield",
                                reference: "alarmhis",
                                boxLabel: "disable",
                                name: "alarmhis",
                                inputValue: false,

                            },
                            {
                                xtype: "radiofield",
                                reference: "alarmhis",
                                boxLabel: "enable",
                                name: "alarmhis",
                                inputValue: true,
                                listeners: {
                                    boxready: function (redio) {
                                        redio.setValue(true)
                                    }
                                }
                            },
                            {
                                xtype: "combo",
                                bind: {
                                    disabled: "{!alarmhis.checked}",
                                },
                                displayField: "name",
                                valueField: "value",
                                editable: false,
                                name: "savetime",
                                store: Ext.create("Ext.data.Store", {
                                    fields: ["name", "value"],
                                    data: [
                                        {name: "7 days", value: 604800000},
                                        {name: "30 days", value: 2592000000}
                                    ]
                                }),
                                listeners: {
                                    boxready: function (combo) {
                                        console.log(combo.setValue(combo.store.getAt(0)))
                                    }
                                }
                            }, {
                                xtype: "button", text: "Ok", handler: function () {


                                    form.submit({
                                        success: function (form, response) {
                                            Ext.Msg.alert("Massage", "Save ok " + response.result.info)
                                            console.log(arguments)
                                        }
                                    })
                                }
                            }
                        ]
                    },

                ]
            })
            var grid = Ext.create("ListenGrid", {
                scrollable: true,

            })
            me.items = [form, grid]
        },
        listeners: {
            boxready: function (window) {
                Ext.Ajax.request({
                    url: EventAlarmUrl,
                    params: {
                        par: "removeTimeoutTag",
                        curtime: new Date().getTime()
                    }
                }).then(function () {
                    console.log(arguments)
                })
                setTimeout(function () {
                    window.collapse()
                }, 1000)
            },
            collapse: function (window) {
                window.setPosition(0, 0, true)
            },

            beforeclose: function (window) {
                window.hide()
                return false;
            }
        },
        buttons: [
            {
                text: "close", handler: function (button) {
                button.up("window").close()
            }
            }
        ]
    });
    //Ext.create("ListenEventAlarm")
    //Ext.create("EventAlarmSetting")

})

/*
 var IPCombo = Ext.create("Ext.form.field.Tag", {
 fieldLabel: "Listen IP",
 store: [window.location.hostname, "192.168.253.253"],
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
 },
 /!* change: function (field, newValue, oldValue) {

 var ipPattern = /(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)/;
 var arr = field.value.filter(function (value, index, source) {
 //console.log(arguments)
 if (ipPattern.test(value)) {
 return true;
 } else {
 return false;
 }
 })
 console.log(arr)
 for (var i = 0; i < arr.length; i++) {
 if (arr[i].indexOf(":") <= 0) {
 arr[i] = arr[i] + ":" + PortCombo.value
 }
 }
 testfield=field
 field.setValue(arr)
 }*!/
 }
 //value: location.hostname
 });
 var PortCombo = Ext.create("Ext.form.field.ComboBox", {
 fieldLabel: "port number",
 store: ["6379"],
 value: "6379"
 });
 var saveButton = Ext.create("Ext.button.Button", {
 text: "Save", handler: function () {
 Ext.Ajax.request({
 url: "php/EventAlarm.php",
 params: {
 par: "setIps",
 ips: Ext.encode(IPCombo.value),
 port: PortCombo.value
 }
 }).then(function () {
 console.log(arguments)
 })
 }
 });
 me.items = [IPCombo, PortCombo, saveButton];
 */
