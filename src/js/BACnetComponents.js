Ext.define("ConfigBACnet", {
    extend: "Ext.window.Window",
    title: "SmartIO BACnet Discovery Wizard",
    autoShow: true,
    width: 850,
    height: 630,
    resizeable: false,
    layout: 'card',
    viewModel: {
        data: {
            whoisDelay: 2,
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
                    me.down('#card-next').setDisabled(false)
                },
                failure: function (response) {
                    alert("failure")
                    console.log(arguments)
                }
            })
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
            },
            {
                xtype: "button",
                text: "Select None"
            }
            ]
        },
        {
            region: "center",
            xtype: "grid",
            // selModel: {
            //     type: 'checkboxmodel',
            // },
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
                    html: ["<h1>BACnet discovery complete</h1>",
                        "<h5>Summary statistics</h5>",
                        "Discovering BACnet device            <strong>  2 of 2 </strong>",
                        "<br>",
                        "Objects discovered for current device:<strong> 0 </strong>",
                        "<br>"
                    ].join("<br>"),
                },
                {
                    xtype: "fieldset",
                    columnWidth: 0.5,
                    title: 'WhoIs Delay',
                    items: {
                        xtype: "grid",
                        store: {
                            fields: ['step', 'status'],
                            storeId: "discoverStore"
                        },
                        columns: [
                            {
                                text: 'Discovery Step',
                                dataIndex: 'step',
                                sortable: false,
                            },
                            {
                                text: 'Status',
                                dataIndex: 'status',
                                sortable: false,
                            }
                        ]
                    }
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