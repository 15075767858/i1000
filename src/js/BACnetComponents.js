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
            errormessage: "",
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
            if (this.text == "Finsh") {
                win.close()
            } else {
                win.showNext()
            }
        }
    }, "   ", {
        text: "Cancel",
        itemId: 'cancel',
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
        var whoisDelay = me.viewModel.get("whoisDelay") * 1000;
        var l = me.getLayout();
        var i = l.activeItem.itemId.split('card_')[1];

        var next = parseInt(i, 10) + incr;

        if (i == 0 & incr == 1) {
            me.layout.next()
            me.down('#card-next').setDisabled(true)
            var store = Ext.StoreManager.lookup("WhoIsDevices");
            iBACnet.getWhoIsData2(whoisDelay, function (err, data) {
                console.log(arguments)
                if (err) {
                    alert("load data failure ,please retry.")
                    me.down('#card-prev').setDisabled(false);
                } else {
                    store.setData(data)
                    me.layout.next()
                    me.down('#card-prev').setDisabled(false);
                    me.down('#card-next').setDisabled(true)
                }
            })
            /*Ext.Ajax.request({
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
            })*/
        } else if (i == 2 & incr == -1) {
            me.layout.setActiveItem("card_0")
            me.down('#card-prev').setDisabled(true);
            me.down('#card-next').setDisabled(false);
        }
        else if (i == 3 & incr == 1) {
            var checkVaues = l.activeItem.down("form").getValues();
            console.log(checkVaues)
            var propertys = []
            for (var value in checkVaues) {
                if (checkVaues[value] == "on") {
                    propertys.push(value);
                }
            }
            var selectDevices = me.viewModel.get("selectDevices");
            var devices = [];
            for (var i = 0; i < selectDevices.length; i++) {
                devices.push(selectDevices[i].data.deviceId)
            }

            console.log(selectDevices)
            var store = Ext.StoreManager.lookup("discoverStore");
            var pCount = 0;
            l.setActiveItem(next);
            console.log(devices, propertys)
            me.down('#card-prev').setDisabled(true);
            me.down('#card-next').setDisabled(true);
            me.down('#cancel').setDisabled(true);
            me.down('#card-next').setText("Finsh");
            var devicesLen = devices.length

            bacnetutil.generateBACnetXml(null, devices, propertys,
                function (err, id, message, status) {
                    if (err) {
                        me.viewModel.set("errormessage", err.message + " Retrying ...");
                    } else {
                        store.add({
                            id: id,
                            step: message,
                            status: status
                        })
                        me.viewModel.set("errormessage", message);
                        if (status == 1) {
                            pCount++
                            var currentDevice = Math.floor(pCount / 2)
                            me.viewModel.set("currentDevice", currentDevice)

                            if (currentDevice == devicesLen) {
                                me.viewModel.set("errormessage", "Discovery has been successful .");
                                me.down('#card-next').setDisabled(false);

                            }
                            else {
                                //    me.down('#card-next').setDisabled(true);
                            }
                        }
                        console.log(arguments)
                    }
                }
            )

            // Ext.Ajax.request({
            //     url: "http://127.0.0.1:2018/generateBACnetXml",
            //     method: "get",
            //     params: { propertys: propertys, deivces: deivces, whoisDelay: whoisDelay }
            // })


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
            // { address: '192.168.253.253',
            // instance: 1103,
            // net: 1100,
            // adr: 3,
            // PROP_OBJECT_NAME: 'Controller',
            // PROP_OBJECT_TYPE: 8,
            // PROP_SYSTEM_STATUS: 0,
            // PROP_VENDOR_NAME: '1000BAS',
            // PROP_VENDOR_IDENTIFIER: 913,
            // PROP_MODEL_NAME: 'PIO',
            // PROP_PROTOCOL_VERSION: '0.8.2',
            // PROP_FIRMWARE_REVISION: '1.3.0',
            // PROP_APPLICATION_SOFTWARE_VERSION: '1.0',
            // PROP_PROTOCOL_SERVICES_SUPPORTED: 'BitString:E9D10104D7',
            // PROP_PROTOCOL_OBJECT_TYPES_SUPPORTED: 'BitString:9B850000000000',
            // PROP_MAX_APDU_LENGTH_ACCEPTED: 480,
            // PROP_SEGMENTATION_SUPPORTED: 0,
            // PROP_NUMBER_OF_APDU_RETRIES: 3,
            // PROP_APDU_TIMEOUT: 6000,
            // PROP_DATABASE_REVISION: 2,
            // PROP_MAX_MASTER: 64,
            // PROP_MAX_INFO_FRAMES: 32,
            // PROP_LOCAL_TIME: '1901-02-02 04:40:32 000',
            // PROP_LOCAL_DATE: '2017-10-20 00:00:00 000',
            // PROP_UTC_OFFSET: 480,
            // PROP_DAYLIGHT_SAVINGS_STATUS: false } ] }
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
                fields: ["address", "deviceId", "maxApdu", "vendorId", "device_name", "vendor", "model", "instance", "prefix", "suffix",
                    {
                        name: "adr",
                        convert: function (v, model) {
                            console.log(model)
                            if (model) {
                                if (model.data) {
                                    if (model.data.npdu) {
                                        if (model.data.npdu.source) {
                                            return model.data.npdu.source.adr;
                                        }
                                    }
                                }
                            }
                            return ""
                        }
                    },
                    {
                        name: "net",
                        convert: function (v, model) {
                            console.log(arguments)
                            if (model) {
                                if (model.data) {
                                    if (model.data.npdu) {
                                        if (model.data.npdu.source) {
                                            return model.data.npdu.source.net;
                                        }
                                    }
                                }
                            }
                            return ""
                        }
                    }],
                data: [
                ]
            },
            columns: [
                {
                    text: "ip",
                    dataIndex: "address"
                },
                {
                    text: "instance",
                    dataIndex: 'deviceId',
                    flex: 1
                },
                {
                    text: "net",
                    dataIndex: 'net',
                    flex: 1
                },
                {
                    text: "adr",
                    dataIndex: 'adr',
                    flex: 1
                },
                {
                    text: "Device Name",
                    hidden: true,
                    dataIndex: 'device_name',
                    flex: 1
                }, {
                    text: "Vendor",
                    hidden: true,
                    dataIndex: 'vendor',
                }, {
                    text: "Model",
                    hidden: true,
                    dataIndex: 'model'
                }, {
                    text: "vendorId",
                    dataIndex: 'vendorId'
                }, {
                    text: "Prefix",
                    hidden: true,
                    dataIndex: 'prefix',
                    width: 120,
                }, {
                    text: "Suffix",
                    hidden: true,
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
                            "<br>",
                            "message:<i style='color:red'>{errormessage} </i>"
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

Ext.define("BACnetDownLoadFile", {
    extend: "Ext.window.Window",
    resizeable:false,
    title: "Download File!!! Operate Carefully!!!",
    autoShow: true,
    width: 500,
    height: 350,
    resizable: false,
    layout: 'card',
    id: "BACnetDownLoadFile",
    viewModel: {
        data: {
            info: "aaa"
        }
    },
    items: {
        margin: "10",
        xtype: 'fieldset',
        columnWidth: 0.5,
        items: {
            border: 0,
            defaults: {
                border: 0,
                margin:"10 0 0 0"
            },
            xtype: "form",
            items: [
                {
                    fieldLabel: "Choose File Type",
                    xtype: "combo",
                    displayField: 'name',
                    valueField: 'value',
                    width: "100%",
                    labelWidth: 166,
                    store: {
                        fields: ["name", "value"],
                        data: [
                            { name: "1、Program File", value: "" },
                            { name: "2、Config File", value: "" },
                            { name: "3、Firmware File", value: "" }
                        ]
                    }
                },
                {
                    layout: "hbox",
                    margin: "5 0 0 0",
                    items: [
                        {
                            xtype: 'checkbox',
                            fieldLabel: "Choose Devide:",
                            labelWidth: 151,
                            inputValue: true,
                        },
                        {
                            xtype: "combo",
                            width: 275,
                        }
                    ]
                },
                {
                    margin: "5 0 0 0",
                    items: [
                        {
                            xtype: "filefield",
                            labelWidth: 166,
                            width: "100%",
                            fieldLabel: "Choose File:"
                        }
                    ]
                },
                {
                    maigin: "30 0",
                    layout: "hbox",
                    defaults: {
                        width:198,
                    },
                    items: [
                        {
                            scale: "large",
                            xtype: "button",
                            text: "Start Download",
                            margin:"0 50 0 0"
                        }, {
                            scale: "large",
                            xtype: "button",
                            text: "Exit",
                        }
                    ]
                }, {
                    border: 1,
                    width: "100%",
                    maigin: "10 0",
                    xtype: "progressbar"
                }, {
                    maigin: "10 0",
                    border: 1,
                    height:88,
                    bind: {
                        html: "{info}"
                    }
                }
            ]
        }
    }
})

Ext.onReady(function () {
    Ext.create("BACnetDownLoadFile")
})