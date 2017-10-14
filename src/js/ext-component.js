
// "nw": "^0.18.2",
// "nw-builder": "^3.1.2"

Ext.define("UpdateWWW", {
    extend: "Ext.window.Window",
    autoShow: true,
    //width: 400,
    titlePosition: "left",
    width: 600,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    defaults: {
        xtype: 'form',
        layout: 'anchor',

        bodyPadding: 10,
        style: {
            'margin-bottom': '20px'
        },
        defaults: {
            anchor: '100%'
        }
    },
    bodyPadding: '10 10 0',
    initComponent: function () {
        var me = this;
        me.items = [

            {
                xtype: 'component',
                html: [
                    '<h3>Update</h3>',
                    '<p>This is a simple update program for updating and upgrading your program directory.',
                    'Please select the update program provided by <code class="smartiologo">Smartio</code> to update <code>.tar.bz2</code>.  ',
                    'Thank you.</p>'
                ]
            },
            {
                xtype: "progressbar",
                itemId: "waitProgress",
                text: "Wait 10 minute ...",
                listeners: {
                    render: function (waitProgress) {
                        testProgress = waitProgress
                    }
                }
            },
            {
                xtype: 'filefield',
                hideLabel: true,
                reference: 'basicFile',
                listeners: {
                    change: function () {
                        var file = this.fileInputEl.dom.files[0]
                        me.setFile(file)
                    }
                }
            }, {
                xtype: "progressbar",
                hidden: true,
                value: 0.5,
                itemId: "updatePregress",
                listeners: {
                    render: function (progressbar) {
                        this.mySetText = function (currentSize, allSize, singleSize) {
                            console.log(this)
                            if (currentSize > allSize) {
                                currentSize = allSize;
                            }
                            this.setValue(currentSize / allSize);
                            var percent = Ext.util.Format.percent(currentSize / allSize);
                            var currentSize = Ext.util.Format.fileSize(currentSize);
                            var allSize = Ext.util.Format.fileSize(allSize);
                            var singleSize = Ext.util.Format.fileSize(singleSize || 0);
                            this.updateText(currentSize + "/" + allSize + "  " + singleSize + "/s " + percent);

                        }
                    }
                }
            },

            {
                xtype: 'button',
                text: 'Start Updating',
                handler: function (button) {
                    if (me.file) {
                        me.uploadBigFile(me.file)
                    }
                }
            }
        ]
        me.callParent();
    },
    setFile: function (file) {
        var me = this;
        //var progressbar = me.down("progressbar")
        var progressbar = me.getComponent("updatePregress");
        var waitProgress = me.getComponent("waitProgress");

        if (file) {
            var filename = file.name;
            //if (filename.substr(filename.indexOf('.'), filename.length) != ".tar.gz") {
            //    Ext.Msg.alert('Massage', "The extension should be <code>.tar.gz</code> !")
            //}
            progressbar.mySetText(0, file.size);
            me.file = file;
            progressbar.show()
        } else {
            me.file = false;
            progressbar.hide()
        }
    },
    uploadBigFile: function (file, callback) {
        var me = this;
        var url = 'upload.php';
        var progressbar = me.getComponent("updatePregress");
        var waitProgress = me.getComponent("waitProgress");

        var singleSize = 1024 * 1024;
        var total = file.size / singleSize;
        $.ajax({
            url: url + "?par=beforeUploadBigFile&fileName=" + file.name,
            async: false,
            success: function (response) {
                console.log(arguments)
            }
        })

        uploadFile(file, 0);

        function installPackage(filename) {

            $.ajax({
                url: url + "?par=installPackage&fileName=" + filename,
                async: true,
                timeout: 0,
                success: function (response) {
                    waitProgress.hide()
                    console.log(response)
                    try {
                        //var res = Ext.decode(response);
                        Ext.Msg.alert("Massage", "ok ");
                    } catch (e) {
                        Ext.Msg.alert("Massage", "info " + response)
                    }
                    me.close()


                },
                failure: function (response) {
                    waitProgress.hide()
                    console.log(response)
                    try {
                        var res = Ext.decode(response);

                        Ext.Msg.alert("Massage", "ok ");
                    } catch (e) {
                        Ext.Msg.alert("Massage", "info " + response)
                    }

                }

            })
        }

        function uploadFile(file, i) {
            var currentSize = i * singleSize;
            var nextSize = i * singleSize + singleSize;
            if (nextSize > file.size) {
                nextSize = file.size;
            }
            var subcontent = file.slice(currentSize, nextSize);
            var fd = new FormData();
            fd.append("file", subcontent);
            $.ajax({
                url: url + "?par=uploadFodlerWWW&fileName=" + file.name,
                type: "post",
                async: false,
                cache: false,
                data: fd,
                contentType: false,
                processData: false,
                success: function (res) {
                    if (isNaN(res)) {
                        Ext.Msg.alert("Message", res)

                    } else {

                        progressbar.mySetText(currentSize, file.size, singleSize)

                        i++;
                        setTimeout(function () {
                            if (currentSize >= file.size) {
                                installPackage(file.name);
                                waitProgress.wait({
                                    interval: 1000
                                });
                                return;
                            } else {
                                uploadFile(file, i);
                            }
                        }, 1)
                    }
                }
            })
        }

        /*for (var i = 0; i < total; i++) {

         var subcontent = file.slice(i * singleSize, i * singleSize + singleSize);
         var fd = new FormData();
         fd.append("file", subcontent);
         $.ajax({
         url: url + "?par=uploadFodlerWWW&fileName=" + file.name,
         type: "post",
         async: false,
         cache: false,
         data: fd,
         contentType: false,
         processData: false,
         success: function (res) {
         if(res){
         Ext.Msg.alert("Message",res)
         }else{

         }
         progressbar.mySetText(i * singleSize, file.size)
         console.log(arguments)

         }
         })

         }
         */
    }

})

Ext.define("UserManager", {
    extend: "Ext.window.Window",
    autoShow: true,
    title: "User Manager",
    width: 400,
    deleteUser: function () {
        var me = this;
        var combo = me.down('combo');
        Ext.Msg.show({
            title: 'Delete User',
            message: 'Do you want to delete this user ' + combo.value + ' ?',
            buttons: Ext.Msg.YESNOCANCEL,
            icon: Ext.Msg.QUESTION,
            fn: function (btn) {
                if (btn === 'yes') {
                    Ext.Ajax.request({
                        url: 'php/login.php?par=deleteUser' + '&username=' + combo.value,
                        success: function (response) {
                            try {
                                var resJson = Ext.decode(response.responseText);
                                Ext.Msg.alert("Massage", resJson.info)
                            } catch (e) {
                                Ext.Msg.alert('error', e + response.responseText);
                                throw new Error(e);
                            }
                        }
                    })
                }
            }
        });
    },
    bbar: [{
        text: "Add User",
        handler: function () {
            var win = Ext.create("Ext.window.Window", {
                title: "Please input password and level .",
                autoShow: true,
                width: 300,
                resizeable: false,
                items: [{
                    xtype: "form",
                    defaults: {
                        margin: 10,
                        allowBlank: false
                    },
                    items: [{
                        xtype: "textfield",
                        fieldLabel: "username",
                        name: "username",
                        maxLength: 20,
                        minLength: 4
                    },
                    {
                        xtype: "textfield",
                        fieldLabel: "password",
                        name: "password",
                        inputType: "password",
                        maxLength: 16,
                        minLength: 4
                    },
                    {
                        xtype: "textfield",
                        fieldLabel: "Enter again",
                        inputType: "password",
                        name: "again",
                        maxLength: 16,
                        minLength: 4
                    },
                    {
                        xtype: "numberfield",
                        fieldLabel: "level",
                        name: "level",
                        minValue: 0,
                        maxValue: 255
                    },
                    ],
                    bbar: [{
                        text: "Ok",
                        handler: function () {
                            var form = this.up("form");
                            if (form.isValid()) {
                                var values = form.getValues();
                                if (values.password != values.again) {
                                    Ext.Msg.alert("Massage", "Two passwords are not consistent .")
                                    return;
                                }
                                form.submit({
                                    url: "php/login.php?par=addUser",
                                    success: function (form, resonse) {
                                        if (resonse.result.success) {
                                            Ext.Msg.alert("Massage", resonse.result.info);
                                        }
                                        console.log(arguments)
                                    },
                                    failure: function (form, response) {
                                        Ext.Msg.alert("Massage", response.result.info)
                                        console.log(arguments)
                                    }
                                })
                            }
                        }
                    },
                    {
                        text: "Cancel",
                        handler: function () {
                            win.close();
                        }
                    }
                    ]
                }]
            })
        }
    },
    {
        text: "Delete User",
        handler: function (button) {
            var win = button.up('window');
            win.deleteUser();

        }
    },
    {
        text: "Change User",
        hidden: true,
        handler: function () {
            var win = Ext.create("Ext.window.Window", {
                title: "Please input password and level .",
                autoShow: true,
                width: 300,
                resizeable: false,
                items: [{
                    xtype: "form",
                    defaults: {
                        margin: 10,
                        allowBlank: false
                    },
                    items: [{
                        xtype: "textfield",
                        fieldLabel: "username",
                        name: "username",
                        maxLength: 20,
                        minLength: 4,
                        hidden: true
                    },
                    {
                        xtype: "textfield",
                        fieldLabel: "password",
                        name: "password",
                        inputType: "password",
                        maxLength: 16,
                        minLength: 4
                    },
                    {
                        xtype: "textfield",
                        fieldLabel: "Enter again",
                        inputType: "password",
                        name: "again",
                        maxLength: 16,
                        minLength: 4
                    },
                    {
                        xtype: "numberfield",
                        fieldLabel: "level",
                        name: "level",
                        minValue: 0,
                        maxValue: 255
                    },
                    ],
                    bbar: [{
                        text: "Ok",
                        handler: function () {
                            var form = this.up("form");
                            if (form.isValid()) {
                                var values = form.getValues();
                                if (values.password != values.again) {
                                    Ext.Msg.alert("Massage", "Two passwords are not consistent .")
                                    return;
                                }
                                form.submit({
                                    url: "php/login.php?par=addUser",
                                    success: function (form, resonse) {
                                        if (resonse.result.success) {
                                            Ext.Msg.alert("Massage", resonse.result.info);
                                        }
                                        console.log(arguments)
                                    },
                                    failure: function (form, response) {
                                        Ext.Msg.alert("Massage", response.result.info)
                                        console.log(arguments)
                                    }
                                })
                            }
                        }
                    },
                    {
                        text: "Cancel",
                        handler: function () {
                            win.close();
                        }
                    }
                    ]
                }]
            })
        }
    }
    ],
    initComponent: function () {
        var me = this;
        var combo = Ext.create("Ext.form.field.ComboBox", {
            store: Ext.create("Ext.data.Store", {
                fields: ["0"],
                autoLoad: true,
                proxy: {
                    type: "ajax",
                    url: "php/login.php?par=getAllUser",
                    reader: {
                        type: "json"
                    }
                }
            }),
            displayField: "0",
            valueField: "0"
        })
        me.items = [combo]
        me.callParent();
    }
})


function popUpdate() {
    //var password = window.prompt("please input password")
    //login("engineerLogin", password);
    Ext.create("LoginWindow", {
        callbackFn: function () {
            Ext.create("UpdateWWW")
        }
    })
}
Ext.define('LoginWindow', {
    extend: 'Ext.window.Window',
    autoShow: true,
    width: 400,
    title: "Login",
    height: 155,
    x: 288,
    y: 88,
    callbackFn: null, //这是个方法用来回调登陆成功事件
    login: function (params) {
        var me = this;
        Ext.Ajax.request({
            url: "php/login.php?par=login",
            method: "post",
            params: params,
            success: function (response) {
                try {
                    var resJson = Ext.decode(response.responseText);
                    if (resJson.isLogin) {
                        me.callbackFn(resJson);
                        me.close()
                    } else {
                        //Ext.Msg.alert("Massage","please login .<br>" + (resJson.info||" "))
                    }
                } catch (e) {
                    Ext.Msg.alert('error', e + response.responseText);
                    throw new Error(e);
                }
            }
        })
    },
    initComponent: function () {
        var me = this;
        var loginForm = Ext.create("Ext.form.Panel", {
            bodyPadding: 10,
            bodyStyle: {
                background: "cornflowerblue"
            },
            items: [{
                xtype: "combo",
                allowBlank: false,
                fieldLabel: 'User Name',
                name: 'username',
                emptyText: 'user name',
                queryMode: "local",
                value: "mngr",
                height: 35,
                store: Ext.create("Ext.data.Store", {
                    fields: ["0"],
                    autoLoad: true,
                    proxy: {
                        type: "ajax",
                        url: "php/login.php?par=getAllUser",
                        reader: {
                            type: "json"
                        }
                    }
                }),
                displayField: "0",
                valueField: "0"
            },
            {
                xtype: "textfield",
                allowBlank: false,
                fieldLabel: 'Password',
                value: "mngr0",
                name: 'password',
                emptyText: 'password',
                inputType: 'password',
                height: 35,
                listeners: {
                    focus: function (field) {
                        var keybord = Ext.getCmp("win" + field.id)
                        if (keybord) {
                            return
                            //keybord.close()
                        }
                        Ext.create("editpic.view.ux.KeyBoard", {
                            id: "win" + field.id,
                            x: me.getX() + me.getWidth() + 5,
                            inputValue: field.getValue(),
                            okFn: function (value) {
                                field.setValue(value)
                            }
                        })
                        if (Ext.getCmp('win' + field.id)) {
                            field.focus();
                        }
                    }

                }
            }
            ],
            defaults: {
                anchor: '100%',
                labelWidth: 120
            }
        })
        me.listeners = {
            boxready: function () {
                me.add(loginForm)
                me.login()
            }
        }
        me.buttons = [{
            text: 'Login',
            handler: function () {
                var values = loginForm.getValues();
                me.login(values)
                /*
                 if (My.isLogin()) {
                 Ext.Msg.alert("Massage", "login success .")

                 } else {
                 Ext.Msg.alert("Massage", 'login failure !')
                 return;
                 }*/

            }
        }]


        me.callParent();
    }
});

Ext.define('editpic.view.ux.KeyBoard', {
    extend: 'Ext.window.Window',
    autoShow: true,
    title: "Keybord",
    width: 251,
    height: 430,
    defaultKeyboard: "123",
    //bodyPadding: 10,
    initComponent: function () {
        var me = this;
        var input = Ext.create("Ext.form.field.Text", {
            width: "97%",
            height: 50,
            margin: 5,
            inputType: "password",
            value: me.inputValue
        });

        var form = Ext.create("Ext.form.Panel", {
            width: "100%",
            defaults: {},
            items: [
                input,
                me.getNumberKeyBoards()
                //me.loadKeyBoard(me.defaultKeyboard)
                //me.getAbcKeyBoards()
            ]
        });
        me.input = input;
        me.items = form;
        me.callParent()
    },
    listeners: {
        boxready: function () {
            var me = this;
            me.inputDom = me.input.el.dom.querySelector("input");
            if (me.inputValue) {
                me.inputDom.selectionStart = me.inputValue.length
                me.inputDom.selectionEnd = me.inputValue.length
            }
        }
    },
    getButton: function (data) {
        var me = this;
        var button = Ext.create("Ext.button.Button", Ext.apply(data, {
            //ui: "keyboard",
            style: {
                backgroundColor: "blue"
            },
            bodyStyle: {
                backgroundColor: "blue"
            },
            //cls: "opacity1",
            scale: 'large',

            handler: function (field) {
                var me = this.up("window");

                //var controller=this;
                me.eventFn(field)
            }

        }))
        return button;
    },
    loadKeyBoard: function (keyboardType) {
        var me = this;
        var form = me.down("form");
        var keyboard = form.getComponent("keyboard")
        if (keyboard) {
            form.remove(keyboard)
        }
        if (keyboardType == "123") {
            form.add(me.getNumberKeyBoards())
        }
        if (keyboardType == "abc") {
            form.add(me.getAbcKeyBoards(0))
        }
        if (keyboardType == "ABC") {
            form.add(me.getAbcKeyBoards(32))
        }
    },
    getNumberKeyBoards: function () {
        var me = this;

        me.setWidth(251)

        var container = Ext.create("Ext.Container", {
            margin: "30 0 0 0",
            defaults: {
                //flex: 10,
                width: 50,
                height: 50
            },
            itemId: "keyboard",
            layout: {
                type: "table",
                columns: 4,
                tdAttrs: {
                    style: 'padding: 5px;'
                }
            },
            items: [
                me.getButton({
                    glyph: 55,
                    inputValue: "7"
                }),
                me.getButton({
                    glyph: 56,
                    inputValue: "8"
                }),
                me.getButton({
                    glyph: 57,
                    inputValue: "9"
                }),
                me.getButton({
                    text: "C",
                    inputValue: "{del}"
                }),
                me.getButton({
                    glyph: 52,
                    inputValue: "4"
                }),
                me.getButton({
                    glyph: 53,
                    inputValue: "5"
                }),
                me.getButton({
                    glyph: 54,
                    inputValue: "6"
                }),
                me.getButton({
                    text: "→",
                    inputValue: "{right}"
                }),
                me.getButton({
                    glyph: 49,
                    inputValue: "1"
                }),
                me.getButton({
                    glyph: 50,
                    inputValue: "2"
                }),
                me.getButton({
                    glyph: 51,
                    inputValue: "3"
                }),
                me.getButton({
                    text: "←",
                    inputValue: "{left}"
                }),
                me.getButton({
                    glyph: 48,
                    inputValue: "0"
                }),
                me.getButton({
                    glyph: 46,
                    inputValue: "."
                }),
                me.getButton({
                    text: "Enter",
                    inputValue: "{Enter}",
                    colspan: 2,
                    width: "100%"
                }),
                me.getButton({
                    text: "abc",
                    colspan: 3,
                    width: "100%",
                    inputValue: "{abc}"
                })
            ]
        })
        return container;
    },
    getAbcKeyBoards: function (isCase) {
        var me = this;

        me.setWidth(670)

        var container = Ext.create("Ext.Container", {
            margin: "30 0 0 0",
            itemId: "keyboard",
            defaults: {
                width: 50,
                height: 50
            },
            layout: {
                type: "table",
                columns: 11,
                tdAttrs: {
                    style: 'padding: 5px;'
                }
            },
            items: [
                me.getButton({
                    glyph: 113 - isCase,
                    inputValue: isCase ? "Q" : "q"
                }),
                me.getButton({
                    glyph: 119 - isCase,
                    inputValue: isCase ? "W" : "w"
                }),
                me.getButton({
                    glyph: 101 - isCase,
                    inputValue: isCase ? "E" : "e"
                }),
                me.getButton({
                    glyph: 114 - isCase,
                    inputValue: isCase ? "R" : "r"
                }),
                me.getButton({
                    glyph: 116 - isCase,
                    inputValue: isCase ? "T" : "t"
                }),
                me.getButton({
                    glyph: 121 - isCase,
                    inputValue: isCase ? "Y" : "y"
                }),
                me.getButton({
                    glyph: 117 - isCase,
                    inputValue: isCase ? "U" : "u"
                }),
                me.getButton({
                    glyph: 105 - isCase,
                    inputValue: isCase ? "I" : "i"
                }),
                me.getButton({
                    glyph: 111 - isCase,
                    inputValue: isCase ? "O" : "o"
                }),
                me.getButton({
                    glyph: 112 - isCase,
                    inputValue: isCase ? "P" : "p"
                }),
                me.getButton({
                    text: "C" || "⌫",
                    inputValue: "{del}"
                }),
                {},
                me.getButton({
                    glyph: 97 - isCase,
                    inputValue: isCase ? "A" : "a"
                }),
                me.getButton({
                    glyph: 115 - isCase,
                    inputValue: isCase ? "S" : "s"
                }),
                me.getButton({
                    glyph: 100 - isCase,
                    inputValue: isCase ? "D" : "d"
                }),
                me.getButton({
                    glyph: 102 - isCase,
                    inputValue: isCase ? "F" : "f"
                }),
                me.getButton({
                    glyph: 103 - isCase,
                    inputValue: isCase ? "G" : "g"
                }),
                me.getButton({
                    glyph: 104 - isCase,
                    inputValue: isCase ? "H" : "h"
                }),
                me.getButton({
                    glyph: 106 - isCase,
                    inputValue: isCase ? "J" : "j"
                }),
                me.getButton({
                    glyph: 107 - isCase,
                    inputValue: isCase ? "K" : "k"
                }),
                me.getButton({
                    glyph: 108 - isCase,
                    inputValue: isCase ? "L" : "l"
                }),
                me.getButton({
                    text: "→",
                    inputValue: "{right}"
                }),
                me.getButton({
                    text: "CapsLock",
                    inputValue: "{bksp}",
                    colspan: 2,
                    xtype: "segmentedbutton",
                    width: "100%"
                }),
                me.getButton({
                    glyph: 122 - isCase,
                    inputValue: isCase ? "Z" : "z"
                }),
                me.getButton({
                    glyph: 120 - isCase,
                    inputValue: isCase ? "X" : "x"
                }),
                me.getButton({
                    glyph: 99 - isCase,
                    inputValue: isCase ? "C" : "c"
                }),
                me.getButton({
                    glyph: 118 - isCase,
                    inputValue: isCase ? "V" : "v"
                }),
                me.getButton({
                    glyph: 98 - isCase,
                    inputValue: isCase ? "B" : "b"
                }),
                me.getButton({
                    glyph: 110 - isCase,
                    inputValue: isCase ? "N" : "n"
                }),
                me.getButton({
                    glyph: 109 - isCase,
                    inputValue: isCase ? "M" : "m"
                }),
                me.getButton({
                    glyph: 46,
                    inputValue: "."
                }),
                me.getButton({
                    text: "←",
                    inputValue: "{left}"
                }),
                me.getButton({
                    text: "123",
                    inputValue: "{123}",
                    colspan: 2,
                    width: "100%"
                }),
                me.getButton({
                    text: " ",
                    inputValue: " ",
                    colspan: 7,
                    width: "100%"
                }),
                me.getButton({
                    text: "Enter",
                    inputValue: "{Enter}",
                    colspan: 2,
                    width: "100%"
                })
            ]
        })
        return container
    },
    eventFn: function (field) {
        var me = this;
        var inputEl = me.inputDom;
        var index = inputEl.selectionStart;
        var value = inputEl.value;
        me.input.focus()
        if (field.inputValue == "{left}") {
            inputEl.selectionStart -= 1;
            inputEl.selectionEnd = inputEl.selectionStart;
            return;
        }
        if (field.inputValue == "{right}") {
            inputEl.selectionStart += 1
            inputEl.selectionEnd = inputEl.selectionStart;
            return;
        }
        if (field.inputValue == "{del}") {
            inputEl.value = value.substring(0, index - 1) + value.substring(index, value.length)
            if (index != value.length) {
                inputEl.selectionStart = index - 1;
                inputEl.selectionEnd = index - 1;
            }
            return;
        }
        if (field.inputValue == "{Enter}") {
            me.okFn(value);
            me.close();
            return;
        }
        if (field.inputValue == "{abc}") {
            me.loadKeyBoard("abc");
            return;
        }
        if (field.inputValue == "{123}") {
            me.loadKeyBoard("123");
            return;
        }
        if (field.inputValue == "{bksp}") {
            if (me.isCase) {
                me.isCase = false
                me.loadKeyBoard("abc");
            } else {
                me.loadKeyBoard("ABC");

                me.isCase = true;
            }
            return;
        }
        if (field.inputValue.length = 1) {
            inputEl.value = value.substring(0, index) + field.inputValue + value.substring(index, value.length)
            inputEl.selectionStart = index + 1;
            inputEl.selectionEnd = index + 1;
            return;
        }

    }
});

function userLogin() {
    var me = this.view;
    var win = Ext.create("Ext.window.Window", {
        autoShow: true,
        width: 400,
        modal: true,
        title: "Login",
        items: {
            xtype: "form",
            itemId: "form",
            defaults: {
                width: "100%",
                editable: false,
                allwoBlank: false
            },
            items: []
        }
    })
    var loginForm = Ext.create("Ext.form.Panel", {
        bodyPadding: 10,
        url: "resources/main.php?par=login",
        method: "POST",
        items: [
            //My.getKeyBordFn(),
            {
                xtype: "textfield",
                allowBlank: false,
                fieldLabel: 'User Name',
                name: 'username',
                emptyText: 'user name',
                value: localStorage.getItem("loginUserName"),
                listeners: {
                    focus: My.textfieldFocus
                }
            },
            {
                xtype: "textfield",
                allowBlank: false,
                fieldLabel: 'Password',
                name: 'password',
                emptyText: 'password',
                inputType: 'password',
                listeners: {
                    click: My.textfieldFocus
                }
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Remember me',
                name: 'remember',
                value: localStorage.getItem("loginRemember")
            }
        ],
        buttons: [
            /*{
             text: 'Register'
             },*/
            {
                text: 'Login',
                handler: function () {
                    var values = loginForm.getValues();
                    if (values['remember']) {
                        localStorage.setItem("loginUserName", values['username']);
                        localStorage.setItem("loginRemember", values['remember']);
                    }
                    loginForm.submit({
                        success: loginFn,
                        failure: loginFn
                    });
                }
            }
        ],
        defaults: {
            anchor: '100%',
            labelWidth: 120
        }
    })

    function loginFn(form, action) {
        console.log(arguments);
        var res = Ext.decode(action.response.responseText);
        var vm = me.getViewModel()
        vm.set(res);
        console.log(res);
        if (res.isLogin) {
            My.delayToast("Massage", "login success .")
        } else {
            Ext.Msg.alert("Massage", "login failure ")
        }
        win.close()
    }

    win.add(loginForm)
}


Ext.define('program.view.grid.BackupGrid', {
    extend: 'Ext.grid.Panel',
    xtype: "backupgrid",


    width: "100%",
    height: "100%",
    region: 'center',
    selModel: {
        mode: "SIMPLE",
        selType: 'checkboxmodel'
    },

    initComponent: function () {
        var me = this;

        me.store = Ext.create("Ext.data.Store", {
            fields: ["name", "lasttime", "size", "filetype"],
            proxy: {
                type: "ajax",
                url: "/program/resources/test1.php?par=getbackupfiles&folder=" + me.folder
            },
            autoLoad: true
        }),

            me.callParent();
    },
    columns: [{
        text: "File Name",
        dataIndex: "src",
        flex: 1,
        renderer: function (val, b, record) {
            val = "/program/" + val;
            return "<a class='adownload' download=" + val + " target='_black' href=" + val + ">" + record.data.name + "<span class='x-col-move-top'></span></a>";
        }
    },
    {
        text: "Last Post",
        dataIndex: "lasttime",
        flex: 2
    },
    {
        text: "File Type",
        dataIndex: "filetype",
        flex: 1
    },
    {
        text: "File Size",
        dataIndex: "size",
        flex: 1,
        renderer: function (val) {
            //console.log(arguments)
            return Ext.util.Format.fileSize(val)
        }
    }
    ],
    listeners: {

        boxready: function () {
            setTimeout(function () {
                var aTag = document.createElement("a");
                if (aTag.download == undefined) {
                    $(".adownload").mousedown(function (e) {
                        Ext.Msg.alert('Message', "If you can't download properly , Please right click on the save .<br>如果不能正常下载请点击鼠标右键，选择目标另存为。");
                        //e.preventDefault();
                        //return false;
                    })
                }
            }, 1000)
        },

        select: function () {
            console.log(arguments)
        },
        selectionchange: function () {
            console.log(arguments)
        }
    },
    getSelectFileNames: function () {
        var grid = this;
        var records = grid.getSelection();
        console.log(records);
        if (records.length == 0) {
            Ext.Msg.alert('Status', 'Select a file please.');
            return null;
        }
        Ext.MessageBox.progress('please wait', {
            msg: 'Server Ready ...'
        });

        var fileNames = "";
        var files = []
        for (var i = 0; i < records.length; i++) {
            Ext.MessageBox.updateProgress(i + 1 / records.length + 1, 'The server is preparing for the ' + (i + 1));
            fileNames += grid.folder + "/" + records[i].data.name + " ";
            files.push(grid.folder + "/" + records[i].data.name + " ")
        }
        return {
            filesArr: files,
            filesStr: fileNames
        };
    },
    buttons: [{
        text: "delete",
        handler: function (button) {
            var grid = this.up("grid");
            var fileJson = grid.getSelectFileNames();
            if (fileJson) {
                Ext.Msg.show({
                    title: 'Delete?',
                    message: "Do you want to delete these " + fileJson.filesArr.length + "  files? ",
                    buttons: Ext.Msg.YESNOCANCEL,
                    icon: Ext.Msg.QUESTION,
                    animateTarget: button,
                    fn: function (btn) {
                        if (btn === 'yes') {
                            Ext.Ajax.request({
                                url: "/program/resources/test1.php",
                                params: {
                                    par: "system",
                                    command: "rm " + fileJson.filesStr
                                }
                            }).then(function () {
                                Ext.MessageBox.close();
                                grid.store.load();
                                console.log(arguments)
                            })
                            /*myAjax("/program/resources/test1.php", function () {
                             Ext.MessageBox.close();
                             grid.store.load();
                             console.log(arguments)
                             }, {
                             par: "system",
                             command: "rm " + fileJson.filesStr
                             })*/
                            console.log('Yes pressed');
                        }
                    }
                });


            }


        }
    },
    {
        text: 'Select Path',
        handler: function () {
            var grid = this.up("grid");
            var records = grid.getSelection();
            console.log(records);
            var fileNames = "";
            if (records.length == 0) {
                Ext.Msg.alert('Status', 'Select a file please.');
                return;
            }

            Ext.MessageBox.progress('please wait', {
                msg: 'Server Ready ...'
            });


            for (var i = 0; i < records.length; i++) {
                Ext.MessageBox.updateProgress(i + 1 / records.length + 1, 'The server is preparing for the ' + (i + 1));
                fileNames += grid.folder + "/" + records[i].data.name + " ";
            }


            console.log(fileNames)

            setTimeout(function () {


                Ext.MessageBox.updateProgress(1 / 1, 'The server is preparing for the ' + (records.length));
                setTimeout(function () {

                    Ext.Ajax.request({
                        url: "/program/resources/test1.php",
                        params: {
                            par: "system",
                            command: "tar czvf pragramBackup.tar.gz " + fileNames
                        }
                    }).then(function () {
                        location.href = "/program/resources/pragramBackup.tar.gz";
                    })


                    Ext.MessageBox.close();
                    win.close();
                }, 500)
            }, 1000)

        }
    }
    ]
});
Ext.define('program.view.window.Backup', {
    extend: 'Ext.window.Window',
    xtype: "backup",
    autoShow: true,
    frame: true,
    width: 800,
    height: 600,
    title: "Backup •••",
    layout: "hbox",

    defaults: {
        flex: 1,
        border: true
    },
    items: [{
        xtype: "backupgrid",
        folder: "devsinfo",
        margin: "0 5 0 0"

    }, {
        xtype: "backupgrid",
        folder: "devxml",
        margin: "0 0 0 5"
    }]
});





Ext.define('SelectKeyWinodw', {
    extend: 'Ext.window.Window',
    alias: "SelectKeyWinodw",
    title: "Select Key",
    autoShow: true,
    width: 600,
    maxHeight: 390,
    scrollable: "y",
    initComponent: function () {
        var me = this;
        me.ip = me.ip || location.host;
        me.port = me.port || "6379";
        me.items = [{
            useArrows: true,
            animate: true,
            checkPropagation: "both",
            bufferedRenderer: false,
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
            tbar: [{
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
            },
            {
                xtype: "textfield",
                emptyText: "Object Name",
                filterName: "text",
                listeners: {
                    buffer: 500,
                    change: "onFilterUp"
                }
            },
            {
                xtype: "textfield",
                emptyText: "key",
                filterName: "value",
                //enableKeyEvents: true,
                listeners: {
                    buffer: 500,
                    change: "onFilterUp"
                }
            }
            ],
            width: "100%",
            height: "100%",
            scrollable: "y",
            modal: true,
            store: {
                type: "tree",
                autoLoad: true,
                filters: [],
                url: "php/main.php?par=nodes",
                proxy: {
                    type: "ajax",
                    url: "php/main.php?par=nodes&ip=" + me.ip + "&port=" + me.port + "",
                    reader: {
                        type: "json"
                    }
                }
            },
            columns: [{
                xtype: "treecolumn",
                dataIndex: "text",
                flex: 1
            },
            {
                text: "object name",
                dataIndex: "text",
                flex: 1
            },
            {
                text: "key",
                dataIndex: "value",
                flex: 1
            },
            ]
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
});
Ext.define("SelectKeyFormWindow", {
    extend: "Ext.window.Window",
    title: "Select Key",
    autoShow: true,
    width: 300,
    height: 215,
    buttons: [{
        text: "select",
        handler: function () {
            var me = this.up("window")
            var form = me.down("form");
            var keyfield = form.getComponent("key")
            var objname = form.getComponent("objname")
            var ip = form.getComponent("ip").value || "127.0.0.1"
            var port = form.getComponent("port").value || "6379"
            var win = Ext.create("SelectKeyWinodw", {
                ip: ip,
                port: port,
                callback: function (selectArr) {
                    console.log(arguments)
                    if (selectArr[0]) {
                        var key = selectArr[0].data.value;
                        var text = selectArr[0].data.text;
                        keyfield.setValue(key);
                        objname.setValue(text);
                    }
                    win.close()
                }
            })
        }
    },
        "->",
    {
        text: "Ok",
        handler: function () {
            var win = this.up("window")
            var form = win.down("form");
            win.callback(form.getValues())
            //grid.store.add(form.getValues())
            win.close();
        }
    },
    {
        text: "Cancel",
        handler: function () {
            this.up("window").close()
        }
    }
    ],
    items: [{
        xtype: "form",
        defaultType: 'textfield',
        //margin:10,
        width: "100%",
        height: "100%",
        defaults: {
            margin: 10,
            allowBlank: false
        },
        listeners: {
            boxready: function (form) {
                var win = form.up("window")
                form.form.setValues({
                    ip: win.ip || "127.0.0.1",
                    port: win.port || 6379
                })
                //form.loadRecord(rec)
            }
        },
        items: [{
            fieldLabel: 'Key',
            name: 'key',
            itemId: "key",
            listeners: {
                change: function (field, newValue, oldValue) {
                    var win = field.up("window")
                    var ip = win.ip;
                    var port = win.port;
                    var objname = field.up().getComponent("objname")
                    if (newValue.length == 7) {
                        Ext.Ajax.request({
                            url: "php/main.php",
                            async: false,
                            params: {
                                par: "getNodeTypeValue",
                                ip: "127.0.0.1",
                                port: "6379",
                                nodename: newValue,
                                type: "Object_Name"
                            },
                            success: function (response) {
                                objname.setValue(response.responseText)
                            }
                        })
                    }
                },

            }
        },

        {
            fieldLabel: 'Object Name',
            name: 'object_name',
            itemId: "objname",
            allowBlank: true
        },
        {
            fieldLabel: "Ip",
            itemId: "ip",
            name: "ip",
            value: "127.0.0.1"
        },
        {
            fieldLabel: "Port",
            name: "port",
            xtype: "numberfield",
            value: "6379",
            itemId: "port",
            //maxValue: 99,
            minValue: 1
        }
        ],
    }]
})

Ext.define("modbusConfig", {
    extend: "Ext.grid.Panel",
    xtype: "modbusConfig",
    typpe: "grid",
    width: "100%",
    height: "100%",
    generateModbusXml: function () {
        var grid = this;
        var store = grid.store;
        var items = store.data.items;
        var root = document.createElement("root");
        //floatInvert
        rootAddItems(root, ["float_invert"], [grid.float_invert])
        rootAddItems(root, ["aiOffset", "aoOffset", "diOffset", "doOffset"], [grid.aiOffset, grid.aoOffset, grid.diOffset, grid.doOffset])
        rootAddItems(root, ["ai_map_reg", "ao_map_reg", "av_map_reg", "bi_map_reg", "bo_map_reg", "bv_map_reg"], [grid.ai_map_reg, grid.ao_map_reg, grid.av_map_reg, grid.bi_map_reg, grid.bo_map_reg, grid.bv_map_reg])
        rootAddItems(root, ["ai_priority", "ao_priority", "av_priority", "bi_priority", "bo_priority", "bv_priority"], [grid.ai_priority, grid.ao_priority, grid.av_priority, grid.bi_priority, grid.bo_priority, grid.bv_priority])

        function rootAddItems(root, types, values) {
            for (var i = 0; i < types.length; i++) {
                var el = document.createElement(types[i]);
                el.innerHTML = values[i];
                root.appendChild(el);
            }
        }
        for (var i = 0; i < items.length; i++) {
            var key = document.createElement("key");
            console.log(items[i])
            key.setAttribute("slavenumber", items[i].data.slavenumber)
            key.setAttribute("key", items[i].data.key)
            key.setAttribute("pointnumber", items[i].data.pointnumber)
            key.innerHTML = items[i].data.objectname
            root.appendChild(key);
        }
        var xmlstr = '<?xml version="1.0" encoding="utf-8"?>' + root.outerHTML;
        console.log(xmlstr);
        return xmlstr;
    },
    loadModbusXml: function (xmlstr) {
        var grid = this;
        var store = grid.store;
        //float_invert
        var float_invert = $(xmlstr).find("float_invert")[0];
        if (float_invert) {
            grid.float_invert = float_invert.innerHTML;
        } else {
            grid.float_invert = 1
        }
        setGridTypesValue(xmlstr, grid, ["float_invert"], [1]);
        setGridTypesValue(xmlstr, grid, ["aiOffset", "aoOffset", "diOffset", "doOffset"], [0, 0, 0, 0]);
        setGridTypesValue(xmlstr, grid, ["ai_map_reg", "ao_map_reg", "av_map_reg", "bi_map_reg", "bo_map_reg", "bv_map_reg"], [4, 3, 3, 2, 1, 1]);
        setGridTypesValue(xmlstr, grid, ["ai_priority", "ao_priority", "av_priority", "bi_priority", "bo_priority", "bv_priority"], [7, 7, 7, 7, 7, 7]);

        function setGridTypesValue(xmlstr, grid, types, defaults) {
            for (var i = 0; i < types.length; i++) {
                var el = $(xmlstr).find(types[i])[0];
                if (el) {
                    grid[types[i]] = el.innerHTML;
                } else {
                    grid[types[i]] = defaults[i];
                }
            }
        }
        var keys = $(xmlstr).find("key");
        var arr = [];
        for (var i = 0; i < keys.length; i++) {
            arr[i] = {
                slavenumber: keys[i].getAttribute("slavenumber"),
                pointnumber: keys[i].getAttribute("pointnumber"),
                key: keys[i].getAttribute("key"),
                objectname: keys[i].innerHTML
            }
        }

        console.log("arr")
        store.add(arr)
    },
    listeners: {
        boxready: function (grid) {
            console.log(grid.store.removeAll())
            Ext.Ajax.request({
                url: "php/file.php",
                params: {
                    par: "get",
                    fileName: "/mnt/nandflash/modbusID.xml"
                }
            }).then(function (response) {
                grid.loadModbusXml(response.responseText)
            })

        }
    },
    plugins: [
        Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        })
    ],
    addModbusChange: function () {
        var grid = this;

        Ext.create("SelectKeyWinodw", {
            callback: function (selectArr) {
                var keys = this.down("treepanel").getChecked();
                keys = keys.filter(function (val, index) {
                    if (val.data.leaf) {
                        return true;
                    } else {
                        return false;
                    }
                })
                keys.sort(function (a, b) {
                    return a.data.value[4] - b.data.value[4];
                })
                var arr = [
                    [],
                    [],
                    [],
                    [],
                    [],
                    []
                ];

                grid.store.removeAll()
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i].data.value;
                    var obj = keys[i].data.text;
                    var num = parseInt(key[4]);
                    var pointnumber = arr[num].length + 1;
                    if (key[4] == "2" || key[4] == "5") {
                        pointnumber += arr[num - 1].length
                    }
                    var data = {
                        slavenumber: 1,
                        pointnumber: pointnumber,
                        key: key,
                        objectname: obj
                    }
                    arr[num].push(data);
                }
                for (var i = 0; i < arr.length; i++) {
                    arr[i] = arr[i].sort(function (a, b) {
                        return a.key - b.key;
                    })
                    for (var j = 0; j < arr[i].length; j++) {
                        var key = arr[i][j].key;
                        arr[i][j].pointnumber = j + 1;
                        if (key[4] == "2" || key[4] == "5") {
                            arr[i][j].pointnumber += arr[i - 1].length
                        }
                    }
                    grid.store.add(arr[i]);
                }
            }
        })


    },
    addModbus: function () {
        var grid = this;
        var selArr = grid.getSelection();
        var model, data;
        if (selArr[0]) {
            model = selArr[0];
        } else {
            model = grid.store.getAt(grid.store.data.length - 1)
            console.log(model)
        }
        if (model) {
            data = {
                slavenumber: model.data.slavenumber,
                pointnumber: parseInt(model.data.pointnumber) + 1,
                pointtype: model.data.pointtype,
                key: parseInt(model.data.key) + 1
            }
        } else {
            data = {}
        }
        var setkeywin = Ext.create("Ext.window.Window", {
            title: "Settings",
            autoShow: true,
            width: 300,
            height: 215,
            buttons: [{
                text: "select",
                handler: function () {
                    var form = setkeywin.down("form");
                    var keyfield = form.getComponent("key")
                    var objname = form.getComponent("objname")
                    var win = Ext.create("SelectKeyWinodw", {
                        ip: "127.0.0.1",
                        port: "6379",
                        callback: function (selectArr) {
                            console.log(arguments)
                            if (selectArr[0]) {
                                var key = selectArr[0].data.value;
                                var text = selectArr[0].data.text;
                                if (key[4] == 4 || key[4] == 3 || key[4] == 1 || key[4] == 0) {
                                    keyfield.setValue(key);
                                    objname.setValue(text);
                                } else {
                                    Ext.Msg.alert("info ", "please select AI,AV,DI,DO");
                                }
                            }
                            win.close()
                        }
                    })
                }
            },
                "->",
            {
                text: "Ok",
                handler: function () {
                    var win = this.up("window")
                    var form = win.down("form");
                    grid.store.add(form.getValues())
                    win.close();
                }
            },
            {
                text: "Cancel",
                handler: function () {
                    this.up("window").close()
                }
            }
            ],
            items: [{
                xtype: "form",
                defaultType: 'textfield',
                //margin:10,
                width: "100%",
                height: "100%",
                defaults: {
                    margin: 10,
                    allowBlank: false
                },
                listeners: {
                    boxready: function (form) {
                        form.form.setValues(data)
                        //form.loadRecord(rec)
                    }
                },
                items: [{
                    fieldLabel: 'Key',
                    name: 'key',
                    itemId: "key",
                    listeners: {
                        change: function (field, newValue, oldValue) {
                            var win = field.up("window")
                            var ip = win.ip;
                            var port = win.port;
                            var objname = field.up().getComponent("objname")
                            if (newValue.length == 7) {
                                Ext.Ajax.request({
                                    url: "php/main.php",
                                    async: false,
                                    params: {
                                        par: "getNodeTypeValue",
                                        ip: "127.0.0.1",
                                        port: "6379",
                                        nodename: newValue,
                                        type: "Object_Name"
                                    },
                                    success: function (response) {
                                        objname.setValue(response.responseText)
                                    }
                                })
                            }
                        },

                    }
                },

                {
                    fieldLabel: 'Object Name',
                    name: 'objectname',
                    itemId: "objname",
                    allowBlank: true
                },
                {
                    fieldLabel: "Slave Number",
                    name: "slavenumber",
                    xtype: "numberfield",
                    //maxValue: 99,
                    minValue: 1
                },
                {
                    fieldLabel: "Point Number",
                    name: "pointnumber",
                    xtype: "numberfield",
                    //maxValue: 99,
                    minValue: 1
                }
                ],
            }]
        })
    },
    deleteModbus: function () {
        var grid = this;
        var selArr = grid.getSelection();
        if (selArr[0]) {
            grid.store.remove(selArr[0])
        }
    },

    tbar: [{
        text: "Change",
        handler: function () {
            var grid = this.up("grid");
            grid.addModbusChange();

        }
    },
    {
        text: "Add",
        handler: function () {
            var grid = this.up("grid");
            grid.addModbus();
        }
    },
    {
        text: "Delete",
        handler: function () {
            var grid = this.up("grid");
            grid.deleteModbus()
        }
    },
    {
        text: "Settings",
        hidden: false,
        handler: function () {
            var grid = this.up("grid");
            Ext.define("RegisterStore", {
                extend: "Ext.data.Store",
                fields: ["name", "value"],
                data: [{
                    name: "Coils 00001",
                    value: 1
                }, {
                    name: "Discrete Registers 10001",
                    value: 2
                }, {
                    name: "Holding Registers 40001",
                    value: 4
                }, {
                    name: "Input Registers 30001",
                    value: 3
                }]
            })

            Ext.define("PriorityStore", {
                extend: "Ext.data.Store",
                fields: ["name", "value"],
                data: [{
                    name: "Priority 1",
                    value: 0
                }, {
                    name: "Priority 2",
                    value: 1
                }, {
                    name: "Priority 3",
                    value: 2
                }, {
                    name: "Priority 4",
                    value: 3
                }, {
                    name: "Priority 5",
                    value: 4
                }, {
                    name: "Priority 6",
                    value: 5
                }, {
                    name: "Priority 7",
                    value: 6
                }, {
                    name: "Priority 8",
                    value: 7
                }, {
                    name: "Priority 9",
                    value: 8
                }, {
                    name: "Priority 10",
                    value: 9
                }, {
                    name: "Priority 11",
                    value: 10
                }, {
                    name: "Priority 12",
                    value: 11
                }, {
                    name: "Priority 13",
                    value: 12
                }, {
                    name: "Priority 14",
                    value: 13
                }, {
                    name: "Priority 15",
                    value: 14
                }, {
                    name: "Priority 16",
                    value: 15
                }]
            })
            Ext.create("Ext.window.Window", {
                title: "Settings",
                autoShow: true,
                width: 330,
                //height: 215,
                buttons: [{
                    text: "Ok",
                    handler: function () {
                        var win = this.up("window")
                        var form = win.down("form");
                        var values = form.getValues();
                        console.log(values)
                        grid.float_invert = values.float_invert;
                        grid.aiOffset = values.aiOffset;
                        grid.aoOffset = values.aoOffset;
                        grid.diOffset = values.diOffset;
                        grid.doOffset = values.doOffset;
                        grid.ai_map_reg = values.ai_map_reg;
                        grid.ao_map_reg = values.ao_map_reg;
                        grid.av_map_reg = values.av_map_reg;
                        grid.bi_map_reg = values.bi_map_reg;
                        grid.bo_map_reg = values.bo_map_reg;
                        grid.bv_map_reg = values.bv_map_reg;
                        grid.ai_priority = values.ai_priority;
                        grid.ao_priority = values.ao_priority;
                        grid.av_priority = values.av_priority;
                        grid.bi_priority = values.bi_priority;
                        grid.bo_priority = values.bo_priority;
                        grid.bv_priority = values.bv_priority;
                        //rec.set(form.getValues());
                        win.close();
                    }
                },
                {
                    text: "Cancel",
                    handler: function () {
                        this.up("window").close()
                    }
                }
                ],
                items: [{
                    xtype: "form",
                    defaultType: 'textfield',
                    //margin:10,
                    width: "100%",
                    height: "100%",
                    defaults: {
                        margin: 10,
                        allowBlank: false
                    },
                    listeners: {
                        boxready: function (form) {
                            //form.loadRecord(rec)
                        }
                    },
                    items: [{
                        xtype: "checkbox",
                        fieldLabel: "Float Invert",
                        inputValue: 1,
                        uncheckedValue: 0,
                        value: grid.float_invert,
                        name: "float_invert"
                    },
                    {
                        xtype: "fieldset",
                        title: "priority",
                        hidden: false,
                        defaults: {
                            xtype: "combo",
                            store: Ext.create("PriorityStore"),
                            displayField: "name",
                            valueField: "value",
                            width: 268
                        },
                        items: [{
                            fieldLabel: "AI",
                            value: grid.ai_priority || 7,
                            name: "ai_priority"
                        },
                        {
                            fieldLabel: "AO",
                            value: grid.ao_priority || 7,
                            name: "ao_priority"
                        },
                        {
                            fieldLabel: "AV",
                            value: grid.av_priority || 7,
                            name: "av_priority"
                        },
                        {
                            fieldLabel: "BI",
                            value: grid.bi_priority || 7,
                            name: "bi_priority"
                        },
                        {
                            fieldLabel: "BO",
                            value: grid.bo_priority || 7,
                            name: "bo_priority"
                        },
                        {
                            fieldLabel: "BV",
                            value: grid.bv_priority || 7,
                            name: "bv_priority"
                        }
                        ]
                    },
                    {
                        xtype: "fieldset",
                        title: "map",
                        hidden: false,
                        defaults: {
                            xtype: "combo",
                            store: Ext.create("RegisterStore"),
                            displayField: "name",
                            valueField: "value",
                            width: 268
                        },
                        items: [{
                            fieldLabel: "AI",
                            value: grid.ai_map_reg || 4,
                            name: "ai_map_reg"
                        },
                        {
                            fieldLabel: "AO",
                            value: grid.ao_map_reg || 3,
                            name: "ao_map_reg"
                        },
                        {
                            fieldLabel: "AV",
                            value: grid.av_map_reg || 3,
                            name: "av_map_reg"
                        },
                        {
                            fieldLabel: "BI",
                            value: grid.bi_map_reg || 2,
                            name: "bi_map_reg"
                        },
                        {
                            fieldLabel: "BO",
                            value: grid.bo_map_reg || 1,
                            name: "bo_map_reg"
                        },
                        {
                            fieldLabel: "BV",
                            value: grid.bv_map_reg || 1,
                            name: "bv_map_reg"
                        }
                        ]
                    },
                    {
                        xtype: "fieldset",
                        title: "Offset",
                        items: [{
                            xtype: "numberfield",
                            value: grid.aiOffset || 0,
                            fieldLabel: 'AI',
                            name: 'aiOffset'
                        }, {
                            xtype: "numberfield",
                            value: grid.aoOffset || 0,
                            fieldLabel: 'AO',
                            name: 'aoOffset'
                        }, {
                            xtype: "numberfield",
                            value: grid.diOffset || 0,
                            fieldLabel: 'DI',
                            name: 'diOffset'
                        }, {
                            xtype: "numberfield",
                            value: grid.doOffset || 0,
                            fieldLabel: 'DO',
                            name: 'doOffset'
                        },

                        ]
                    },
                    ],
                }]
            })
        }
    },
        "->",
    {
        text: "Export ...",
        handler: function () {
            open("php/file.php?par=get&fileName=/mnt/nandflash/modbusID.xml&header=Content-Disposition: attachment; filename=modbusId.xml");
        }
    }
    ],
    initComponent: function () {
        var me = this;
        var ip = "127.0.0.1";
        var port = "6379";
        me.columns = [{
            text: "Slave Number",
            dataIndex: "slavenumber",
            flex: 1,
            editor: {
                xtype: 'numberfield',
                allowBlank: false,
                minValue: 1,
                //maxValue: 99
            }
        },
        {
            text: "Register Type",
            renderer: function (und, ele, model) {
                var key = model.data.key
                if (key) {
                    switch (key[4]) {
                        case "0":
                            return "3";
                        case "1":
                            return "4";
                        case "2":
                            return "4";
                        case "3":
                            return "1";
                        case "4":
                            return "0";
                        case "5":
                            return "0";
                    }
                }
            }
        },
        {
            text: "Point Number",
            dataIndex: "pointnumber",
            flex: 1,
            renderer: function (und, ele, model) {
                var type = model.data.key[4];
                if (type == "0" || type == "1" || type == "2") {
                    return und * 2 - 1;
                } else {
                    return und;
                }
            },
            editor: {
                xtype: 'numberfield',
                allowBlank: false,
                minValue: 1,
                //maxValue: 99
            }
        },
        {
            text: "type",
            dataIndex: "pointtype",
            width: 40,
            renderer: function (und, ele, model) {
                var key = model.data.key
                if (key) {
                    switch (key[4]) {
                        case "0":
                            return "AI";
                        case "1":
                            return "AO";
                        case "2":
                            return "AV";
                        case "3":
                            return "BI";
                        case "4":
                            return "BO";
                        case "5":
                            return "BV";
                    }
                }
            }
        },
        {
            text: "Object_Name",
            dataIndex: "objectname",
            flex: 2,
            // editor: {
            //     xtype: 'textfield',
            //     allowBlank: false
            // },
            renderer: function (und, ele, model) {
                var key = model.data.key
                //console.log(arguments)
                if (und != "") {
                    return und;
                }
                if (key) {
                    Ext.Ajax.request({
                        url: "php/main.php",
                        async: false,
                        params: {
                            par: "getNodeTypeValue",
                            ip: ip,
                            port: port,
                            nodename: model.data.key,
                            type: "Object_Name"
                        },
                        success: function (response) {
                            und = response.responseText;
                            model.data.objectname = und
                        }
                    })
                }
                return und;
            }
        },
        {
            text: "Key",
            dataIndex: "key",
            flex: 1,
            editor: {
                xtype: 'textfield',
                allowBlank: false
            },

        },
        {
            xtype: 'actioncolumn',
            text: "Setting",
            hidden: true,
            width: 60,
            items: [{
                icon: "resources/setting_24px.png",
                tooltip: 'Edit',

            }]
        }
        ]
        me.callParent();
    },
    store: Ext.create("Ext.data.Store", {
        fields: ["slavenumber", "pointnumber", {
            name: 'pointtype',
            convert: function (val, model) {
                //console.log(arguments)
                //console.log(this);
                //var startingBonus = val * .1;
                var key = model.data.key;
                if (key)
                    return key[4];
                return null;
            }
        }, "objectname", "key"],
        groupField: 'pointtype',
        data: []
    }),
    features: [{
        ftype: 'grouping'
    }],

})
Ext.define("ListenIps", {
    extend: "Ext.grid.Panel",
    width: 500,
    height: 300,
    store: Ext.create("Ext.data.XmlStore", {
        autoLoad: true,
        fields: ["ip", "port"],
        proxy: {
            url: "php/file.php?fileName=/mnt/nandflash/listenip.xml&par=get",
            type: "ajax",
            reader: {
                type: 'xml',
                record: "item",
                rootProperty: "root"
            }
        },
        data: []
    }),
    getXmlStr: function () {
        var me = this;
        var store = me.store;
        var items = store.data.items;
        var root = document.createElement("root");
        for (var i = 0; i < items.length; i++) {
            var item = document.createElement("item");
            var ip = document.createElement("ip");
            var port = document.createElement("port");
            ip.innerHTML = items[i].data.ip;
            port.innerHTML = items[i].data.port;
            item.appendChild(ip)
            item.appendChild(port)
            root.appendChild(item);
        }
        var xmlstr = '<?xml version="1.0" encoding="utf-8"?>' + root.outerHTML;
        console.log(xmlstr);
        return xmlstr
    },
    saveIpsXml: function () {
        var xmlstr = this.getXmlStr()
        Ext.Ajax.request({
            url: "php/file.php",
            method: "POST",
            params: {
                par: "save",
                fileName: "/mnt/nandflash/listenip.xml",
                content: xmlstr
            }
        }).then(function (response) {
            if (isNaN(response.responseText)) {
                Ext.Msg.alert("info ", "save file done " + response.responseText)
            } else {
                Ext.Msg.alert("info ", "save file ok " + response.responseText)
            }
        })
    },
    columns: [{
        text: "Ip",
        dataIndex: "ip",
        flex: 1,
        editor: {
            xtype: 'textfield',
            allowBlank: false
        }
    },
    {
        text: "Port",
        dataIndex: "port",
        flex: 1,
        editor: {
            xtype: 'numberfield',
            allowBlank: false,
            minValue: 1,
            //maxValue: 99
        }
    }
    ],
    plugins: [
        Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        })
    ],
    addIp: function () {
        var grid = this;
        var selArr = grid.getSelection();
        grid.store.add({
            ip: "192.168.253.253",
            port: 6379
        })
    },
    deleteIp: function () {
        var grid = this;
        var selArr = grid.getSelection();
        if (selArr[0]) {
            grid.store.remove(selArr[0])
        }
    },
    initComponent: function () {
        var me = this;
        me.callParent();
    },
    listeners: {
        boxready: function (grid) {
            testgrid = grid
            console.log(arguments)
        }
    }
})


Ext.define('QueryDataRecord', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Ext.data.*',
        'Ext.grid.*',
        'Ext.util.*',
        'Ext.toolbar.Paging'
    ],
    xtype: 'progress-bar-pager',
    height: 360,
    frame: true,
    initComponent: function () {
        this.width = 800;
        var me = this;
        var ip = this.ip || "127.0.0.1";
        var keys = this.keys;
        var pageSize = 25;

        Ext.apply(this, {
            store: Ext.create("Ext.data.Store", {
                autoLoad: true,
                fields: [{
                    name: 'device_instance',
                    type: 'string'
                },
                {
                    name: 'Object_Name',
                    type: 'string'
                },
                {
                    name: 'Present_Value',
                    type: 'string'
                },
                {
                    name: 'last_update_time',
                    type: 'date'
                }
                ],
                pageSize: pageSize,
                proxy: {
                    type: 'ajax',
                    url: 'php/mysql.php?par=getDataRecord&ip=' + ip + "&keys=" + keys,
                    reader: {
                        type: 'json',
                        rootProperty: "topics",
                        totalProperty: 'totalCount',
                    }
                },
                listeners: {
                    load: function () {
                        console.log(arguments)
                    }
                }
            }),
            columns: [{
                text: 'Device Instance',
                sortable: true,
                dataIndex: 'device_instance',
                flex: 1
            }, {
                text: 'Device Type',
                sortable: true,
                dataIndex: 'device_type',
                flex: 1,
                renderer: function (val) {
                    switch (val) {
                        case "0":
                            return "AI";
                        case "1":
                            return "AO";
                        case "2":
                            return "AV"
                        case "3":
                            return "BI"
                        case "4":
                            return "BO"
                        case "5":
                            return "BV"
                        default:
                            return val;
                    }
                }
            }, {
                text: 'device_number',
                sortable: true,
                dataIndex: 'device_number',
                flex: 1
            }, {
                text: 'Object Name',
                sortable: true,
                dataIndex: 'Object_Name',
                flex: 1
            }, {
                text: 'Present Value',
                sortable: true,
                dataIndex: 'Present_Value',
                flex: 1
            }, {
                text: 'Last Updated',
                sortable: true,
                dataIndex: 'last_update_time',
                flex: 1
            }],
            bbar: {
                xtype: 'pagingtoolbar',
                pageSize: 10,
                displayInfo: true,
                items: [
                    "-", {
                        listeners: {
                            change: function (field, newV, oldV) {
                                me.store.setPageSize(newV)
                            }
                        },
                        value: pageSize,
                        fieldLabel: "pageSize",
                        xtype: "textfield",
                        labelWidth: 50,
                        width: 100
                    }
                ]
                //plugins: Ext.ProgressBar()
            }
        });


        this.callParent();
    },


});

Ext.define('QueryEventRecord', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Ext.data.*',
        'Ext.grid.*',
        'Ext.util.*',
        'Ext.toolbar.Paging',
    ],
    xtype: 'progress-bar-pager',
    height: 360,
    frame: true,
    initComponent: function () {
        var me = this;
        this.width = 1000;
        var ip = this.ip || "127.0.0.1";
        var keys = this.keys;
        var pageSize = 25;
        Ext.apply(this, {
            store: Ext.create("Ext.data.Store", {
                autoLoad: true,
                fields: [{
                    name: 'Object_Name',
                    type: 'string'
                },
                {
                    name: 'Description',
                    type: "string"
                },
                {
                    name: 'device_instance',
                    type: 'string'
                },
                {
                    name: 'device_number',
                    type: 'string'
                },
                {
                    name: 'Present_Value',
                    type: 'string'
                },
                {
                    name: 'message_number',
                    type: 'string'
                },
                {
                    name: 'last_update_time',
                    type: 'date'
                }
                ],
                proxy: {
                    type: 'ajax',
                    url: 'php/mysql.php?par=getEventData&ip=' + ip + "&keys=" + keys,
                    reader: {
                        type: 'json',
                        rootProperty: "topics",
                        totalProperty: 'totalCount'
                    }
                },
                listeners: {
                    load: function () {
                        console.log(arguments)
                    }
                }
            }),
            columns: [{
                text: 'Device Type',
                sortable: true,
                hidden: true,
                dataIndex: 'device_type',
                flex: 1,
                renderer: function (val) {
                    switch (val) {
                        case "0":
                            return "AI";
                        case "1":
                            return "AO";
                        case "2":
                            return "AV"
                        case "3":
                            return "BI"
                        case "4":
                            return "BO"
                        case "5":
                            return "BV"
                        default:
                            return val;
                    }
                }
            },
            {
                text: 'Object Name',
                sortable: true,
                dataIndex: 'Object_Name',
                flex: 2
            },

            {
                text: 'Description',
                sortable: true,
                dataIndex: 'Description',
                flex: 2
            },
            {
                text: 'Device Instance',
                sortable: true,
                dataIndex: 'device_instance',
                flex: 1
            },
            {
                text: 'Device Number',
                sortable: true,
                dataIndex: 'device_number',
                flex: 1
            }, {
                text: 'Present Value',
                sortable: true,
                dataIndex: 'Present_Value',
                flex: 1
            },
            {
                text: "Message",
                sortable: true,
                dataIndex: "message_number",
                flex: 2.5,

            },
            {
                text: 'Last Updated',
                sortable: true,
                dataIndex: 'last_update_time',
                flex: 2
            }
            ],
            bbar: {
                xtype: 'pagingtoolbar',
                pageSize: 10,
                displayInfo: true,
                //plugins: Ext.ProgressBar()
                items: [
                    "-", {
                        listeners: {
                            change: function (field, newV, oldV) {
                                me.store.setPageSize(newV)
                            }
                        },
                        value: pageSize,
                        fieldLabel: "pageSize",
                        xtype: "textfield",
                        labelWidth: 50,
                        width: 100
                    }
                ]
            }
        });
        this.callParent();
    },


});


function setIpsWindow() {
    Ext.create("Ext.window.Window", {
        width: 500,
        height: 300,
        title: "Setting Listen Ip",
        autoShow: true,
        scrollable: "y",
        items: [
            Ext.create("ListenIps", {})
        ],
        buttons: [{
            text: "Add",
            handler: function () {
                var grid = this.up("window").down("grid")
                grid.addIp()
            }
        },
        {
            text: "Delete",
            handler: function () {
                var grid = this.up("window").down("grid")
                grid.deleteIp();
            }
        },
            "->",
        {
            text: "Ok",
            handler: function () {
                var grid = this.up("window").down("grid")
                console.log(grid)
                grid.saveIpsXml();
            }
        },
        {
            text: "Cancel",
            handler: function () {
                this.up("window").close()
            }
        }
        ]
    })
}


function showDataRecordWindow() {
    var IPCombo = Ext.create("Ext.form.field.ComboBox", {
        fieldLabel: "Sources IP",
        store: ['127.0.0.1', window.location.hostname, "192.168.253.253"],
        labelWidth: 70,
        maxWidth: 300,
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
        getSelectPoints: function () {
            var me = this;
            var checkeds = me.getChecked();
            var keysArr = [];
            for (var i = 0; i < checkeds.length; i++) {
                if (checkeds[i].data.depth == 4) {
                    keysArr.push(checkeds[i].data.key)
                }
            }
            return keysArr;
        },
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
            text: "config filter point",
            handler: function () {
                Ext.create("FilterPointWindow", {
                    callback: function (res) {
                        //Ext.Msg.alert("Info","Ok");
                    }
                })
            }
        }, {
            text: "config database",
            handler: function () {
                var win = Ext.create("Ext.window.Window", {
                    title: "Config database .",
                    autoShow: true,
                    width: 300,
                    resizeable: false,
                    items: [{
                        xtype: "form",
                        defaults: {
                            margin: 10,
                            allowBlank: false
                        },
                        items: [{
                            xtype: "textfield",
                            fieldLabel: "Database host",
                            name: "host",
                            value: "127.0.0.1"
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "username",
                            name: "username",
                            value: "root"
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "password",
                            name: "password",
                            inputType: "password",
                            value: "root"
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "Database name",
                            name: "databasename",
                            value: "smartio_db"
                        }, {
                            xtype: "button",
                            text: "create ",
                            handler: function () {
                                var form = this.up("form");
                                form.submit({
                                    url: "php/mysqlInit.php?par=createTable",
                                    success: function (form, action) {
                                        Ext.Msg.alert('Info ', action.response.responseText);
                                    },
                                    failure: function (form, action) {
                                        Ext.Msg.alert('Info ', action.response.responseText);
                                    }
                                })
                            }
                        }
                        ],
                        listeners: {
                            boxready: function (form) {
                                Ext.Ajax.request({
                                    url: "php/mysqlInit.php?par=getConfig",
                                    success: function (response) {
                                        var xml = $(response.responseText);
                                        var host = xml.find("host").text()
                                        var username = xml.find("username").text()
                                        var password = xml.find("password").text()
                                        var databasename = xml.find("databasename").text()
                                        var ojson = {
                                            host: host || "127.0.0.1",
                                            username: username || "root",
                                            password: password || "root",
                                            databasename: databasename || "smartio_db"
                                        }
                                        form.getForm().setValues(ojson)
                                    }
                                })
                            }
                        },
                        buttons: [{
                            text: "Test Connect",
                            handler: function () {
                                var form = this.up("form");
                                form.submit({
                                    url: "php/mysqlInit.php?par=testConnect",
                                    success: function (form, action) {
                                        Ext.Msg.alert('Info ', action.response.responseText);
                                    },
                                    failure: function (form, action) {
                                        Ext.Msg.alert('Info ', action.response.responseText);
                                    }
                                })

                            }
                        },
                            "->",
                        {
                            text: "Ok",
                            handler: function () {
                                var form = this.up("form");
                                if (form.isValid()) {
                                    var values = form.getValues();
                                    form.submit({
                                        url: "php/mysqlInit.php?par=saveConfig",
                                        success: function (form, action) {
                                            Ext.Msg.alert('Info ', action.response.responseText);
                                        },
                                        failure: function (form, action) {
                                            Ext.Msg.alert('Info ', action.response.responseText);
                                        }
                                    })
                                }
                            }
                        },
                        {
                            text: "Cancel",
                            handler: function () {
                                win.close();
                            }
                        }
                        ]
                    }]
                })
            }
        }, {
            text: "config Listeners Ip",
            handler: function () {
                setIpsWindow()
            }
        }]
    })
    Ext.create("Ext.window.Window", {
        height: 500,
        width: 700,
        title: "Data Record",
        autoShow: true,
        renderTo: Ext.getBody(),
        layout: "border",
        items: [formPanel, treePanel],
        buttons: [{
            text: "Run/Restart",
            handler: function () {
                Ext.Ajax.request({
                    url: "php/mysqlinit.php?par=runListen"
                }).then(function (response) {
                    console.log(response.responseText);
                    Ext.Msg.alert("info", " ok .");
                })
            }
        },
            "->",
        {
            text: "Show Event",
            handler: function () {
                var keysArr = treePanel.getSelectPoints();

                var qdr = Ext.create("QueryEventRecord", {
                    ip: IPCombo.value,
                    keys: keysArr.join(",")
                })
                // var cdr = Ext.create("ChartDataRecord", {
                //     store: qdr.store
                // })

                Ext.create("Ext.window.Window", {
                    title: "Show Data Record",
                    autoShow: true,
                    scrollable: "y",
                    items: [qdr]
                })


            }
        },
        {
            text: "Show",
            handler: function () {
                var keysArr = treePanel.getSelectPoints();
                var qdr = Ext.create("QueryDataRecord", {
                    ip: IPCombo.value,
                    keys: keysArr.join(",")
                })
                var cdr = Ext.create("ChartDataRecord", {
                    store: qdr.store
                })

                Ext.create("Ext.window.Window", {
                    title: "Show Data Record",
                    autoShow: true,
                    scrollable: "y",
                    items: [cdr, qdr]
                })
            }
        }
        ]

    })
}

Ext.define("FilterPoint", {
    extend: "Ext.grid.Panel",
    alias: "FilterPoint",
    xtype: "FilterPoint",
    width: 500,
    height: 300,
    store: Ext.create("Ext.data.XmlStore", {
        autoLoad: true,
        fields: ["ip", "port", "object_name", "key"],
        proxy: {
            url: "php/file.php?fileName=/mnt/nandflash/filterpoint.xml&par=get",
            type: "ajax",
            reader: {
                type: 'xml',
                record: "item",
                rootProperty: "root"
            }
        },
        data: []
    }),
    getXmlStr: function () {
        var me = this;
        var store = me.store;
        var items = store.data.items;
        var root = document.createElement("root");
        for (var i = 0; i < items.length; i++) {
            var item = document.createElement("item");
            var ip = document.createElement("ip");
            var port = document.createElement("port");
            var object_name = document.createElement("object_name");
            var key = document.createElement("key");

            ip.innerHTML = items[i].data.ip;
            port.innerHTML = items[i].data.port;
            object_name.innerHTML = items[i].data.object_name;
            key.innerHTML = items[i].data.key;

            item.appendChild(ip)
            item.appendChild(port)
            item.appendChild(object_name)
            item.appendChild(key)
            root.appendChild(item);
        }
        var xmlstr = '<?xml version="1.0" encoding="utf-8"?>' + root.outerHTML;
        console.log(xmlstr);
        return xmlstr
    },
    saveIpsXml: function () {
        var xmlstr = this.getXmlStr()
        Ext.Ajax.request({
            url: "php/file.php",
            method: "POST",
            params: {
                par: "save",
                fileName: "/mnt/nandflash/filterpoint.xml",
                content: xmlstr
            }
        }).then(function (response) {
            if (isNaN(response.responseText)) {
                Ext.Msg.alert("info ", "save file done " + response.responseText)
            } else {
                Ext.Msg.alert("info ", "save file ok " + response.responseText)
            }
        })
    },
    columns: [{
        text: "Ip",
        dataIndex: "ip",
        flex: 1,
        editor: {
            xtype: 'textfield',
            allowBlank: false
        }
    },
    {
        text: "Port",
        dataIndex: "port",
        flex: 1,
        hidden: true,
        editor: {
            xtype: 'numberfield',
            allowBlank: false,
            minValue: 1,
            //maxValue: 99
        }
    },
    {
        text: "Key",
        dataIndex: "key",
        flex: 1,
        editor: {
            xtype: "textfield",
            allowBlank: false
        }
    },
    {
        text: "Object_Name",
        dataIndex: "object_name",
        flex: 1,
        renderer: function (und, ele, model) {
            var key = model.data.key
            //console.log(arguments)
            if (und != "") {
                return und;
            }
            if (key) {
                Ext.Ajax.request({
                    url: "php/main.php",
                    async: false,
                    params: {
                        par: "getNodeTypeValue",
                        ip: ip,
                        port: port,
                        nodename: model.data.key,
                        type: "Object_Name"
                    },
                    success: function (response) {

                        und = response.responseText;
                        model.data.objectname = und
                    }
                })
            }
            return und;
        }
    }
    ],
    plugins: [
        Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        })
    ],
    addItem: function (data) {
        var grid = this;
        //var selArr = grid.getSelection();
        grid.store.add(data)
    },
    deleteSelectItem: function () {
        var grid = this;
        var selArr = grid.getSelection();
        if (selArr[0]) {
            grid.store.remove(selArr[0])
        }
    },
    initComponent: function () {
        var me = this;
        me.callParent();
    },
    listeners: {
        boxready: function (grid) {
            testgrid = grid
            console.log(arguments)
        }
    }
})

Ext.define("FilterPointWindow", {
    extend: "Ext.window.Window",
    width: 500,
    height: 300,
    title: "Setting Event No Listen Point",
    autoShow: true,
    scrollable: "y",
    items: [{
        xtype: "FilterPoint"
    }],
    buttons: [{
        text: "Add",
        handler: function () {
            var grid = this.up("window").down("grid")
            Ext.create("SelectKeyFormWindow", {
                callback: function (res) {
                    console.log(res)
                    grid.addItem(res)
                }
            })
        }
    },
    {
        text: "Delete",
        handler: function () {
            var grid = this.up("window").down("grid")
            grid.deleteSelectItem();
        }
    },
        "->",
    {
        text: "Ok",
        handler: function () {
            var grid = this.up("window").down("grid")
            console.log(grid)
            grid.saveIpsXml();
        }
    },
    {
        text: "Cancel",
        handler: function () {
            this.up("window").close()
        }
    }
    ]
})
Ext.define("ChartDataRecord", {
    extend: "Ext.chart.CartesianChart",
    //xtype: 'cartesian',
    reference: 'chart',
    width: "100%",
    height: 500,
    insetPadding: 40,
    innerPadding: {
        left: 18,
        right: 18,
        top: 18
    },
    sprites: [{
        type: 'text',
        text: 'SmartIO Tools Data Record ',
        fontSize: 22,
        width: 100,
        height: 30,
        x: 40, // the sprite x position
        y: 30 // the sprite y position
    }],

    tbar: {
        itemId: "toolbar",
        items: [
            '->',
            {
                hidden: true,
                text: 'Refresh',
                handler: 'onRefresh'
            },
            {
                hidden: true,
                text: 'Switch Theme',
                handler: 'onThemeSwitch'
            },
            {
                text: 'Reset pan/zoom',
                handler: function () {
                    console.log(arguments)
                    console.log(this)
                    console.log(this.up("cartesian"))
                    var chart = this.up("cartesian"),
                        axes = chart.getAxes();
                    axes[0].setVisibleRange([0, 1]);
                    axes[1].setVisibleRange([0, 1]);
                    chart.redraw();
                }
            },
            ""
        ]
    },
    interactions: [{
        type: 'panzoom',
        zoomOnPan: true
    }
        //'itemhighlight'
    ],
    animation: {
        duration: 200
    },

    listeners: {
        itemhighlightchange: function (chart, newHighlightItem, oldHighlightItem) {
            this.setSeriesLineWidth(newHighlightItem, 3, "#FF1111");
            this.setSeriesLineWidth(oldHighlightItem, 2, "#30BDA7");
            //console.log(arguments)
        },
        afterrender: function () {
            //console.log(this)
            var chart = this;
            var toolbar = this.getComponent('toolbar');
            console.log(toolbar)
            var panzoom = chart.getInteractions()[0];
            panzoom.getModeToggleButton()

            toolbar.add(panzoom.getModeToggleButton());
        }
    },
    setSeriesLineWidth: function (item, lineWidth, stroke) {
        if (item) {
            item.series.setStyle({
                lineWidth: lineWidth,
                //stroke:stroke
            });
        }
    },
    axes: [{
        type: 'numeric',
        position: 'left',
        fields: ['Present_Value'],
        title: {
            //text: 'SmartIO Data Record ',
            text: "Present Value",
            fontSize: 15
        },
        grid: true,
    }, {
        type: 'time',
        grid: true,
        //dateFormat: 'Y-m-d',
        //visibleRange: [0, 1],
        position: 'bottom',
        fields: ['last_update_time', "Object_Name"],
        titleMargin: 12,
        title: {
            text: 'Time'
        }
    }],
    series: [{
        type: 'line',
        style: {
            stroke: 'rgba(0,0,0,0.8)',
            lineWidth: 1
        },
        highlightCfg: {
            scaling: 2
        },
        xField: 'last_update_time',
        yField: 'Present_Value',

        label: {
            field: 'Object_Name',
            display: 'over',
            fontSize: 10,
            translateY: 5, // lower label closer to the marker
            renderer: function (val) {
                //console.log(arguments)
                return val
            }
        },
        marker: {
            type: 'circle',
            fill: "white",
            fx: {
                duration: 200,
                easing: 'backOut'
            }
        },
        tooltip: {
            trackMouse: true,
            showDelay: 0,
            dismissDelay: 0,
            hideDelay: 0,
            renderer: function (tooltip, record, item) {
                var arr = ["Object Name :" + record.data.Object_Name,
                "Device Instance :" + record.data.device_instance,
                "Device Type :" + record.data.device_type,
                "Device Number :" + record.data.device_number,
                "Present Value :" + record.data.Present_Value,
                "Time :" + new Date(record.data.last_update_time).toLocaleString()
                ]
                if (record.data.message_number) {
                    arr.push("message :" + record.data.message_number + "");
                }
                tooltip.setHtml(arr.join("<br>"))
            }
        }
    }]
})
Ext.onReady(function () {
    // var qdr = Ext.create("QueryEventRecord", {
    //     ip: "127.0.0.1",
    //     keys: "1001201,1001202,1001203,1001205"
    // })
    // var cdr = Ext.create("ChartDataRecord", {
    //     store: qdr.store
    // })
    //
    // Ext.create("Ext.window.Window", {
    //     title: "Show Data Record",
    //     autoShow: true,
    //     scrollable: "y",
    //     items: [cdr, qdr]
    // })

    // Ext.create("Ext.window.Window", {
    //     autoShow: true,
    //     width: 800,
    //     height: 600,
    //     items: Ext.create("ChartDataRecord")
    // })
})