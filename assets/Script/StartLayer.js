
//开始层
cc.Class({
    extends: require('NetComponent'),

    properties: {
        loadCircle: cc.Node,
        logLabel: cc.Label,
        msgWindow: cc.Node,
        msgLab: cc.Label,
        phoneId: cc.EditBox,
        password: cc.EditBox,
    },

    // use this for initialization
    onLoad() {
        this._super();
        if (!Network.isInit) {
            Network.initNetwork();
        }
    },

    login() {

    },

    //收到消息
    getNetData(event) {
        let msg = event.detail;
        if (msg && msg.f) {
            let m = msg || {};
            switch (msg.f) {
                case "":
                    break;
            }
        }
    },


    requireFail: function () {
        this.loadCircle.active = false;
    },
    //微信授权登陆，进入游戏
    gameStar: function (sender) {
        if (!this.phoneId.string) {
            this.showMsg("手机号码不能为空");
            return;
        }
        if (!this.password.string) {
            this.showMsg("密码不能为空");
            return;
        }
        if (!Network.getInstance().isInit) {
            Network.getInstance().initNetwork();
        }
        if (!Network.getInstance().isInit) {
            return;
        }
        Network.getInstance().onLogin(this.phoneId.string, this.password.string);
        this.loadCircle.active = true;
        this.loadCircle.runAction(cc.repeatForever(cc.rotateBy(1, 180)));
    },
    okBtnHandler: function () {
        this.msgWindow.active = false;
    },
    /**显示提示窗口 */
    showMsg: function (msg) {
        this.msgWindow.active = true;
        this.msgLab.string = msg;
        this.loadCircle.active = false;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});


let p1 = new Promise((resolve, reject) => {
    console.log('hello');
    resolve('aaa');
});

p1.then(v1 => {
    console.log('hello2', v1);
    return 'bbb'
}).then(
    v2 => {
        console.log('hello3', v2);
    },
    err => { console.log(err); }
    ).catch(err => { console.log(err); });



let p2 = new Promise((resolve, reject) => {
    //reject(new Error('Error 1'));
    resolve();
});
p2.then(()=>{
    throw new Error('Error 2');
}).catch(err => {
    console.log(err);
})
