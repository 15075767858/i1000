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
    listeners: {
        boxready: function (win) {
            win.viewModel.set("selectFacilty", Ext.getCmp("mainPanel").projectPath.dir + "\\facilty")
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
                iFile.copyBacnetConfigXml(win.down("#selectFacilty").getValue())
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
                itemId: "selectFacilty",
                bind: {
                    value: "{selectFacilty}"
                },
                width: 500
            }, {
                xtype: "button",
                text: "...",
                handler: function () {
                    var me = this.up("window")
                    var mainPanel = Ext.getCmp("mainPanel")

                    var selectFileTree = mainPanel.getFaciltyTree()
                    var win = Ext.create("Ext.window.Window", {
                        autoShow: true,
                        width: 200,
                        height: 600,
                        autoScroll: true,
                        items: [
                            selectFileTree
                        ],
                        buttons: [
                            {
                                text: "Select",
                                handler: function () {
                                    var selectArr = selectFileTree.getSelection();
                                    console.log(selectArr)
                                    if (!selectArr[0]) {
                                        Ext.Msg.alert("Massage", "Please select a Folder .");
                                    } else {
                                        me.down("#selectFacilty").setValue(selectArr[0].data.path)
                                    }
                                }
                            }, {
                                text: "Cancel",
                                handler: function () {
                                    win.close();
                                }
                            }
                        ]
                    })

                }
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
            items: [
                {
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
    resizeable: false,
    title: "Download File!!! Operate Carefully!!!",
    autoShow: true,
    width: 500,
    height: 350,
    resizable: false,
    layout: 'card',
    id: "BACnetDownLoadFile",
    viewModel: {
        data: {
            fileInstance: 0,
            chooseDeivce: false,
            deviceId: null,
            fileName: null,
            info: "Before Download File ,Please Ensure Communication Clear,and Don't Make Any Read and Write Operations of Equipment,Avoid Download Failed."
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
                margin: "10 0 0 0"
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
                    bind: "{fileInstance}",
                    store: {
                        fields: ["name", "value"],
                        data: [
                            { name: "1、Program File", value: "1" },
                            { name: "2、Config File", value: "2" },
                            { name: "3、Firmware File", value: "3" }
                        ]
                    },
                    listeners: {
                        change: function (field, newValue) {
                            var win = field.up("window")
                            var viewModel = win.viewModel
                            win.down("#chooseFile").setValue("")
                            switch (newValue) {
                                case "1":
                                    viewModel.set("info", "You have Chosen to Download the Program File. Please Continue to Select the Device You Need to Download! If You do not Need Check File,Select in the Checkbox Below.");
                                case "2":
                                    viewModel.set("info", "You have Chosen to Download the Program File. Please Continue to Select the Device You Need to Download! If You do not Need Check File,Select in the Checkbox Below.");
                                case "3":
                                    viewModel.set("info", "You have Chosen to Upgrade Firmware. Please Continue to Select the Device You Need to Upgrade!");
                            }
                            field.up("window").down("#chooseDevice").setDisabled(false)
                            console.log(arguments)
                        }
                    }
                },
                {
                    layout: "hbox",
                    margin: "5 0 0 0",
                    disabled: true,
                    itemId: "chooseDevice",
                    items: [
                        {
                            xtype: 'checkbox',
                            fieldLabel: "Choose Device:",
                            bind: "{chooseDeivce}",
                            labelWidth: 151,
                            inputValue: true,
                            uncheckedValue: false,
                            listeners: {
                                change: function (field, newValue) {
                                    var viewModel = field.up("window").viewModel;
                                    var fileInstance = viewModel.get("fileInstance")
                                    if (fileInstance - 3 == 0 & newValue === true) {
                                        Ext.MessageBox.show({
                                            title: "Download File",
                                            msg: 'Firmware Update Must Check Model-Name & Firmware_Version!',
                                            buttons: Ext.MessageBox.OK,
                                            scope: this,
                                            fn: function () {
                                                field.setValue(false)
                                            },
                                            icon: Ext.MessageBox.ERROR,
                                        });
                                    } else {
                                        viewModel.set("info", "When You Choose the Checkbox,The Program Will not Judge the SelectFile Instance Number!!<br>This Function is Suitable for Bulk Downloading of the Same Type of Equipment.")
                                    }
                                }
                            }
                        },
                        {
                            xtype: "combo",
                            width: 275,
                            valueField: "deviceId",
                            displayField: "show",
                            itemId: "deviceId",
                            bind: "{deviceId}",
                            emptyText: "Discovering Bacnet Devices ...",
                            disabled: true,
                            listeners: {
                                boxready: function (field) {
                                    iBACnet.getWhoIsData2(3000, function (err, devices) {
                                        if (!err) {
                                            var store = Ext.create("Ext.data.Store", {
                                                fields: ["deviceId",
                                                    "net", "adr", {
                                                        name: "show",
                                                        convert: function (val, model) {
                                                            return "Instance:" + model.data.deviceId + " NET:" + model.data.net + " MAC:" + model.data.adr
                                                        }
                                                    }],
                                                data: devices
                                            })
                                            field.setEmptyText("Discovery Bacnet Device " + devices.length)
                                            field.setStore(store)
                                            field.setDisabled(false)
                                        }
                                    })
                                },
                                change: function (field, newValue, oldValue) {
                                    console.log(arguments)
                                    var retryCount = 3;
                                    new bacnetutil.bacnetdevice.BACnetDevice(newValue + "", function (err, device) {
                                        if (err) {
                                            if (retryCount-- == 0) {
                                                Ext.MessageBox.show({
                                                    title: "Download File",
                                                    msg: 'Can Not Acquired the Selected Device Firmware-Version and Model-Name,Please Check Communication Status,Or shut down other BACnet programs ,and Try Again. ',
                                                    buttons: Ext.MessageBox.OK,
                                                    scope: this,
                                                    fn: function () {
                                                        field.setValue(false)
                                                    },
                                                    icon: Ext.MessageBox.ERROR,
                                                });
                                            }
                                        } else {
                                            device.closeClient();
                                            Ext.MessageBox.show({
                                                title: "Download File",
                                                msg: 'Current Select Model Name:' + device.PROP_MODEL_NAME + ',Firmware Version:' + device.PROP_FIRMWARE_REVISION + 'Please Select a Corresponding ProgramFile to Update!',
                                                buttons: Ext.MessageBox.OK,
                                                scope: this,
                                                fn: function () {
                                                    var win = field.up("window")
                                                    win.down("#chooseFile").setValue("")
                                                    win.down("#chooseFile").setDisabled(false)
                                                },
                                                icon: Ext.MessageBox.INFO,
                                            });
                                        }
                                    })
                                }
                            }
                        }
                    ]
                },
                {
                    margin: "5 0 0 0",
                    items: [
                        {
                            itemId: "chooseFile",
                            disabled: true,
                            xtype: "filefield",
                            labelWidth: 166,
                            width: "100%",
                            bind: "{fileName}",
                            fieldLabel: "Choose File:",
                            listeners: {
                                change: function (field, newValue) {
                                    var win = field.up("window");
                                    var viewModel = win.viewModel;

                                    
                                    bacnetutil.checkUploadFile(viewModel.get("fileInstance"), newValue, viewModel.get("chooseDeivce") ? null : viewModel.get("deviceId") + "", function (err, result) {
                                        if (err) {
                                            Ext.MessageBox.show({
                                                title: "Download File",
                                                msg: err.message,
                                                buttons: Ext.MessageBox.OK,
                                                scope: this,
                                                fn: function () {
                                                    win.down("#startDownlaod").setDisabled(true)
                                                },
                                                icon: Ext.MessageBox.ERROR
                                            });
                                        } else {
                                            Ext.MessageBox.show({
                                                title: "Download File",
                                                msg: result,
                                                buttons: Ext.MessageBox.OK,
                                                scope: this,
                                                fn: function () {
                                                    win.down("#startDownlaod").setDisabled(false)
                                                },
                                                icon: Ext.MessageBox.INFO
                                            });
                                        }
                                    })
                                }
                            }
                        }
                    ]
                },
                {
                    maigin: "30 0",
                    layout: "hbox",
                    defaults: {
                        width: 198,
                    },
                    items: [
                        {
                            scale: "large",
                            xtype: "button",
                            disabled: true,
                            itemId: "startDownlaod",
                            text: "Start Download",
                            margin: "0 50 0 0",
                            handler: function () {
                                var win = this.up("window");
                                var viewModel = win.viewModel;
                                var progress = win.down("#uploadProgress");
                                console.log(win.down("#deviceId").getSelectedRecord())
                                console.log(viewModel.get("fileInstance"), viewModel.get("fileName"))
                                bacnetutil.writeFile(win.down("#deviceId").getSelectedRecord().data, viewModel.get("fileInstance"), true, viewModel.get("fileName"), function (message, v) {
                                    progress.setValue(v)
                                    if (v === 1) {
                                        Ext.Msg.alert("Download File", "File Download Success!!! Please Wait For the Device to Restart! You Could Close Download Window and Clear Device List , Then Waiting Device Online.");
                                    }
                                })
                            }
                        }, {
                            scale: "large",
                            xtype: "button",
                            text: "Exit",
                            handler: function () {
                                this.up("window").close()
                            }
                        }
                    ]
                }, {
                    border: 1,
                    width: "100%",
                    maigin: "10 0",
                    xtype: "progressbar",
                    itemId: "uploadProgress"
                }, {
                    maigin: "10 0",
                    border: 1,
                    height: 88,
                    bind: {
                        html: "{info}"
                    }
                }
            ]
        }
    }
})
Ext.onReady(function () {
    //Ext.create("BACnetDownLoadFile")
})
Ext.define("MainPanel", {
    extend: "Ext.panel.Panel",
    id: "mainPanel",
    title: "",
    renderTo: Ext.getBody(),
    width: "100%",
    height: "100%",
    layout: "border",
    loadProject: function (path) {
        var me = this;
        var res = iFile.loadProject(path);
        if (res.projectPath.ext == ".iqb") {
            me.isOpenProject = true;
            me.projectPath = res.projectPath;
            me.projectInfo = res.projectInfo;
            me.setTitle(res.projectPath.base);
            //me.selectFileTree = selectFileTree;
            var FaciltyTree = me.getFaciltyTree()
            var pointGrid = Ext.create("PointGrid", {
                region: "center",
            })
            FaciltyTree.addListener("itemclick", function (treeview, record) {
                pointGrid.loadProject(record.data.path)
            })
            me.add([
                FaciltyTree,
                pointGrid
            ])
            //var data = new iFile.FileTree().setAsyncView(true).setViewExtname([]).getTreeChilds(me.projectPath.dir)
            //me.selectFileTree.store.setData(data)
        }
    },
    getFaciltyTree: function () {
        var mainPanel = this;
        var SelectFileTree = Ext.create("SelectFileTree", {
            viewExtname: [],
            region: "west",
            width: 190,
            resizable: true,
            rootVisible: true
        })
        var projectPath = mainPanel.projectPath.dir + "\\facilty"
        var data = new iFile.FileTree().setAsyncView(true).setViewExtname([]).getTreeChilds(projectPath);
        var store = Ext.create('Ext.data.TreeStore', {
            root: {
                text: "facilty",
                path: projectPath,
                expanded: true,
                children: data
            }
        });
        SelectFileTree.setStore(store);
        return SelectFileTree;
    },
    // initComponent: function () {
    //     var me = this;
    //     var selectFileTree = Ext.create("SelectFileTree", {
    //         viewExtname: [],
    //         region: "west",
    //         width: 190,
    //         resizable: true
    //     })
    //     me.selectFileTree = selectFileTree
    //     me.items = [
    //         me.getFaciltyTree(),
    //         //selectFileTree,
    //         {
    //             region: "center",
    //         }
    //     ]
    //     me.callParent();
    // }
})


Ext.define("SelectFileTree", {
    extend: "Ext.tree.TreePanel",
    width: "100%",
    height: "100%",
    asyncView: false,//true 显示所有 false异步显示
    viewExtname: false, //[".jpg",".xml"]
    rootVisible: false,
    reloadFolder: function (record) {
        var tree = this;
        if (record.data.path) {
            var data = new iFile.FileTree().setAsyncView(tree.asyncView).setViewExtname(tree.viewExtname).getTreeChilds(record.data.path)
            record.appendChild(data)
        }
    },
    listeners: {
        itemexpand: function (record) {
            this.reloadFolder(record)
        },
        itemcollapse: function (record) {
            record.removeAll()
        },
        itemcontextmenu: function (tree, record, item, index, e, eOpts) {
            e.stopEvent();
            var self = this;
            console.log(arguments)
            if (record.data.leaf) //folder
            {
                console.log(record.data.leaf)
            } else {
                Ext.create("Ext.menu.Menu", {
                    autoShow: true,
                    x: e.pageX + 5,
                    y: e.pageY + 5,
                    items: [{
                        text: "Create Folder",
                        handler: function () {
                            Ext.Msg.prompt('Create Folder', 'Please enter Folder name:', function (btn, text) {
                                if (btn == 'ok') {
                                    if (text) {
                                        iFile.createFolder(record.data.path + "/" + text)
                                        self.reloadFolder(record)
                                    }
                                    // process text value and close...
                                }
                            });
                        }
                    }, {
                        text: "Rename",
                        handler: function () {
                            Ext.Msg.prompt('Create Folder', 'Please enter Folder name:', function (btn, text) {
                                if (btn == 'ok') {
                                    if (text) {
                                        iFile.renameFile(record.data.path, text)
                                        self.reloadFolder(record.parentNode)
                                    }
                                    // process text value and close...
                                }
                            });
                        }
                    }]
                })
                console.log(record.data.leaf)
            }
        }
    }
})


Ext.define("SelectFileWindow", {
    extend: "Ext.window.Window",
    autoShow: true,
    width: 600,
    height: 600,
    filePath: false,
    autoScroll: true,
    initComponent: function () {
        var me = this;
        var selectFileTree = Ext.create("SelectFileTree", {
            viewExtname: me.viewExtname || "*"
        })
        new iFile.FileTree().getRootLetter(function (arr) {
            console.log(arr)
            var store = Ext.create('Ext.data.TreeStore', {
                root: {
                    expanded: true,
                    children: arr
                }
            })
            selectFileTree.setStore(store)
        })
        me.items = selectFileTree;
        var buttons = [
            {
                text: "Select",
                handler: function () {
                    var selectArr = selectFileTree.getSelection();
                    console.log(selectArr)
                    if (!selectArr[0]) {
                        Ext.Msg.alert("Massage", "Please select a Folder .");
                    } else {
                        me.callback(selectArr)
                    }
                }
            }, {
                text: "Cancel",
                handler: function () {
                    me.close();
                }
            }
        ]
        me.buttons = buttons;
        me.callParent()
    }

})

Ext.define("PointGrid", {
    extend: "Ext.grid.Panel",
    store: {
        fields: ["object_name", "description", "location"],
    },
    loadProject: function (path) {
        var me = this;
        iFile.loadBacnetXmlData(path, function (arr) {
            me.store.setData(arr)
        })
    },
    columns: [
        {
            text: "Object Name",
            dataIndex: "object_name",
            flex: 1
        }, {
            text: "Description",
            dataIndex: "description",
            flex: 1
        }, {
            text: "Location",
            dataIndex: "location",
            flex: 1,
            hidden: true
        }
    ]
})

