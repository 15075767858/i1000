Ext.define("ConfigBACnet", {
    extend: "Ext.window.Window",
    title: "SmartIO BACnet Discovery Wizard",
    autoShow: true,
    width: 850,
    height: 630,
    resizeable: false,
    layout: 'card',
    id: "ConfigBACnet",
    viewModel: {
        data: {
            whoisDelay: 2,
            selectDevices: [],
            currentDevice: 0,
            page2: [

            ]
        }
    },
    buttons: [{
        text: "< Back",
        itemId: 'card-prev',
        disabled: true,
        handler: function () {
            var win = this.up("window")
            win.showPrevious()
            console.log(win)
        }
    }, {
        text: "Next >",
        itemId: 'card-next',
        handler: function () {
            var win = this.up("window")
            win.showNext()
        }
    }, "   ", {
        text: "Cancel",
        handler: function () {
            this.up("window").close();
        }
    }],
    showNext: function () {
        this.doCardNavigation(1);
    },
    showPrevious: function (btn) {
        this.doCardNavigation(-1);
    },
    doCardNavigation: function (incr) {
        var me = this;
        var whoisDelay = me.viewModel.whoisDelay;
        var l = me.getLayout();
        var i = l.activeItem.itemId.split('card_')[1];

        var next = parseInt(i, 10) + incr;
        if (i == 0 & incr == 1) {
            me.layout.next()
            me.down('#card-next').setDisabled(true)
            var store = Ext.StoreManager.lookup("WhoIsDevices");
            Ext.Ajax.request({
                async: true,
                url: "http://127.0.0.1:2018/getWhoIsDevices?whoisDelay=" + whoisDelay,
                success: function (response) {
                    var data = Ext.decode(response.responseText);
                    store.setData(data)
                    console.log(arguments)
                    me.layout.next()
                    me.down('#card-prev').setDisabled(false);
                    me.down('#card-next').setDisabled(true)
                },
                failure: function (response) {
                    alert("load data failure ,please retry.")
                    console.log(arguments)
                }
            })
        } else if (i == 3 & incr == 1) {
            var checkVaues = l.activeItem.down("form").getValues();
            console.log(checkVaues)
            var propertys = []
            for (var value in checkVaues) {
                if (checkVaues[value] == "on") {
                    propertys.push(value);
                }
            }
            var selectDevices = me.viewModel.get("selectDevices");
            var deivces = [];
            for (var i = 0; i < selectDevices.length; i++) {
                deivces.push(selectDevices[i].data.instance)
            }
            console.log(selectDevices)
            Ext.Ajax.request({
                url: "http://127.0.0.1:2018/generateBACnetXml",
                method: "get",
                params: { propertys: propertys, deivces: deivces }
            })
            
            l.setActiveItem(next);
        } else {
            l.setActiveItem(next);
            me.down('#card-prev').setDisabled(next === 0);
            me.down('#card-next').setDisabled(next === 7);
        }

        console.log(next)

        //win.down("#whoisDelay").value
    },
    defaults: {
        border: false,
    },
    items: [{
        itemId: "card_0",
        layout: "border",
        items: [
            {
                region: 'west',
                xtype: "image",
                src: "../assets/mstpcontroller.jpg",
                width: 300
            },
            {
                region: "center",
                border: false,
                defaults: {
                    margin: 10
                },
                items: [{
                    border: 0,
                    html: ["<h1>Welcome to the SmartIO BACnet discovery wizard</h1>",
                        "This wizard will discover BACnet objects from the BACnet devices that are visible on the network.",
                        "<br>",
                        "Please specify the necessary waiting time to receive device responses from the network and then click Next to continue.",
                        "<br>"
                    ].join("<br>"),
                },
                {
                    xtype: "fieldset",
                    columnWidth: 0.5,
                    title: 'WhoIs Delay',
                    items: {
                        bind: "{whoisDelay}",
                        itemId: "whoisDelay",
                        fieldLabel: "second(s)",
                        xtype: "numberfield",
                        maxValue: 10,
                        minValue: 2
                    }
                }
                ]
            },
        ]
    }, {
        itemId: "card_1",
        title: "<h2>select the types BACnet devices to discover</h2>",
        bind: {
            html: [
                "<br>",
                "&nbsp&nbsp&nbspGatherning responses and discovering object properties, please wait...",
                "<br>",
                "&nbsp&nbsp&nbsp(minimum {whoisDelay} second wait)"
            ].join("<br>")
        },

    }, {
        itemId: "card_2",
        title: "<h2>select the types BACnet devices to discover</h2>",
        layout: "border",
        items: [{
            region: "south",
            layout: "hbox",
            defaults: {
                margin: 10
            },
            items: [{
                xtype: "textfield",
                fieldLabel: "Assign Location",
                value: "facilty",
                width: 500
            }, {
                xtype: "button",
                text: "..."
            }]
        },
        {
            region: "east",
            layout: "vbox",
            defaults: {
                margin: 20,
                scale: 'large'
            },
            items: [{
                xtype: "button",
                text: "Select All",
                handler: function () {
                    this.up("window").down("#WhoIsDeviceGrid").selModel.selectAll()
                }
            },
            {
                xtype: "button",
                text: "Select None",
                handler: function () {
                    this.up("window").down("#WhoIsDeviceGrid").selModel.deselectAll()
                }
            }
            ]
        },
        {
            region: "center",
            xtype: "grid",
            itemId: "WhoIsDeviceGrid",
            // selModel: {
            //     type: 'checkboxmodel',
            // },
            listeners: {
                selectionchange: function (check, selected, eOpts) {
                    var win = this.up("window");
                    win.down('#card-next').setDisabled(!selected.length);
                    win.viewModel.set("selectDevices", selected)
                    console.log(this)
                    console.log(arguments)
                }
            },
            selType: 'checkboxmodel',
            store: {
                storeId: "WhoIsDevices",
                fields: ["device_name", "vendor", "model", "instance", "prefix", "suffix"],
                data: [
                ]
            },
            columns: [{
                text: "Device Name",
                dataIndex: 'device_name',
                flex: 1
            }, {
                text: "Vendor",
                dataIndex: 'vendor',
            }, {
                text: "Model",
                dataIndex: 'model'
            }, {
                text: "Instance",
                dataIndex: 'instance'
            }, {
                text: "Prefix",
                dataIndex: 'prefix',
                width: 120,
            }, {
                text: "Suffix",
                dataIndex: "suffix",
            }]
        }
        ]
    }, {
        itemId: "card_3",
        title: "<h2>select the types BACnet devices to discover</h2>",
        layout: "border",
        items: [{
            region: "center",
            title: "Object Types",
            xtype: "form",
            height: "100%",
            border: 0,
            layout: {
                type: "table",
                columns: 3,
                tableAttrs: {
                    style: {
                        margin: 10
                    }
                }
            },
            defaultType: "checkboxfield",
            defaults: {
                margin: 10,
                checked: true
            },
            itemId: "selectPropertys",
            selectAllChecked: function (value) {
                var me = this;
                var items = me.items.items;
                for (var i = 0; i < items.length; i++) {
                    items[i].setValue(value)
                }
            },
            items: [{
                boxLabel: "Accumulator",
                name: "OBJECT_ACCUMULATOR"
            },
            {
                boxLabel: "Analog Input",
                name: "OBJECT_ANALOG_INPUT"
            }, {
                boxLabel: "Analog Output",
                name: "OBJECT_ANALOG_OUTPUT"
            }, {
                boxLabel: "Analog Value",
                name: "OBJECT_ANALOG_VALUE"
            }, {
                boxLabel: "Averaging",
                name: "OBJECT_AVERAGING"
            }, {
                boxLabel: "Binary Input",
                name: "OBJECT_BINARY_INPUT"
            }, {
                boxLabel: "Binary Output",
                name: "OBJECT_BINARY_OUTPUT"
            }, {
                boxLabel: "Binary Value",
                name: "OBJECT_BINARY_VALUE"
            }, {
                boxLabel: "Calendar",
                name: "OBJECT_CALENDAR"
            }, {
                boxLabel: "Command",
                name: "OBJECT_COMMAND"
            }, {
                boxLabel: "Event Enrollment",
                name: "OBJECT_EVENT_ENROLLMENT"
            }, {
                boxLabel: "File",
                name: "OBJECT_FILE"
            }, {
                boxLabel: "Group",
                name: "OBJECT_GROUP"
            }, {
                boxLabel: "Loop",
                name: "OBJECT_LOOP"
            }, {
                boxLabel: "Life Safety Point",
                name: "OBJECT_LIFE_SAFETY_POINT"
            }, {
                boxLabel: "Life Safety Zone",
                name: "OBJECT_LIFE_SAFETY_ZONE"
            }, {
                boxLabel: "Multistate Input",
                name: "OBJECT_MULTI_STATE_INPUT"
            }, {
                boxLabel: "Multistate Output",
                name: "OBJECT_MULTI_STATE_OUTPUT"
            }, {
                boxLabel: "Multistate Value",
                name: "OBJECT_MULTI_STATE_VALUE"
            }, {
                boxLabel: "Notification Class",
                name: "OBJECT_NOTIFICATION_CLASS"
            }, {
                boxLabel: "Program",
                name: "OBJECT_PROGRAM"
            }, {
                boxLabel: "Pulse Converter",
                name: "OBJECT_PULSE_CONVERTER"
            }, {
                boxLabel: "Schedule",
                name: "OBJECT_SCHEDULE"
            }, {
                boxLabel: "Trendlog",
                name: "OBJECT_TRENDLOG"
            },
            ]
        },
        {
            region: "east",
            layout: "vbox",
            defaults: {
                margin: 20,
                scale: 'large'
            },
            items: [{
                xtype: "button",
                text: "Select All",
                handler: function () {
                    var win = this.up("window");
                    win.down("#selectPropertys").selectAllChecked(1)
                }
            },
            {
                xtype: "button",
                text: "Select None",
                handler: function () {
                    var win = this.up("window");
                    win.down("#selectPropertys").selectAllChecked(0)
                }
            }
            ]
        }
        ],
    }, {
        itemId: "card_4",
        layout: "border",
        items: [
            {
                region: 'west',
                xtype: "image",
                src: "../assets/bacnetrouter.png",
                width: 300
            },
            {
                region: "center",
                border: false,
                defaults: {
                    margin: 10
                },
                items: [{
                    border: 0,
                    bind: {
                        html: ["<h1>BACnet discovery complete</h1>",
                            "<h5>Summary statistics</h5>",
                            "Discovering BACnet device            <strong>  {currentDevice} of { selectDevices.length } </strong>",
                            "<br>",
                            "Objects discovered for current device:<strong> {currentDevice} </strong>",
                            "<br>"
                        ].join("<br>"),
                    }
                },
                {
                    xtype: "grid",

                    store: {
                        fields: ['step', 'status'],
                        storeId: "discoverStore",
                        data: [
                            { step: "Get existing project devices", status: 1 },
                            { step: "Get existing project object", status: 1 },
                            { step: "{device_name}:Adding device to project", status: 0.7 },
                            { step: "{device_name}:Discovering object properties", status: 0.8 }
                        ]
                    },
                    columns: [
                        {
                            width: 50,
                            renderer: function () {
                                return "<img  src=../assets/yes_ok.png>"
                            },
                        },
                        {
                            text: 'Discovery Step',
                            dataIndex: 'step',
                            sortable: false,
                            flex: 1
                        },
                        {
                            text: 'Status',
                            dataIndex: 'status',
                            sortable: false,
                            width: 88,
                            xtype: 'widgetcolumn',
                            widget: {
                                xtype: 'progressbarwidget',
                                // bind: '{record.capacityUsed}',
                                textTpl: [
                                    '{percent:number("0")}%'
                                ]
                            }
                        }
                    ]

                }
                ]
            },
        ]
    }, {
        itemId: "card_5",
        html: "6"
    }, {
        itemId: "card_6",
        html: "7"
    }, {
        itemId: "card_7",
        html: "8"
    }, {
        itemId: "card_8",
        html: "9"
    },]
})