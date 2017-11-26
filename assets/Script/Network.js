
var WebSocket = WebSocket || window.WebSocket || window.MozWebSocket;
window.NetTarget = null;

var instance = null;
var Network = cc.Class({
    properties: {
        socket: null,
        data: 1000,
        isInit: false,
    },

    ctor(){
        NetTarget = new cc.EventTarget();
    },
    initNetwork: function (msg) {
        cc.log('Network initSocket...');
        var host = "ws://localhost:4001";
        this.socket = new WebSocket(host);
        this.socket.onopen = function (evt) {
            cc.log('Network onopen...');
            this.isInit = true;
            NetTarget.emit("netstart", msg);
        }.bind(this);
        this.socket.onmessage = function (evt) {
            var msg = evt.data;
            cc.log('Network onmessage...');
            var dataObj = JSON.parse(msg);
            cc.log(dataObj);
            this.appandeMsg(dataObj);
        }.bind(this);
        this.socket.onerror = function (evt) {
            cc.log('Network onerror...');
            NetTarget.emit('neterror');
        };
        this.socket.onclose = function (evt) {
            cc.log('Network onclose...');
            NetTarget.emit("netclose");
            this.isInit = false;
        }.bind(this);
    },

    send: function (data) {
        if (!this.isInit) cc.log('Network is not inited...');
        else if (this.socket.readyState == WebSocket.OPEN) {
            var tdata = JSON.stringify(data);
            cc.log('Network send:' + tdata);
            this.socket.send(tdata);
        } else cc.log('Network WebSocket readState:' + this.socket.readyState);
    },
    close: function () {
        if (this.socket) {
            cc.log("Network close...");
            this.socket.close();
            this.socket = null;
        }
    },

    //接受数据
    appandeMsg: function (data) {
        NetTarget.emit("net", data);
    },
});

var net = instance ? instance : new Network();
window.Network = net;


// (function () {

//     function getNetworkInstance() {
//         var networkInstance = {
//             socket: null,
//             isInit: false,
//             msg: null,
//             oldMsg: null,
//             method: null,
//             mFun: null,
//             game: null,
//             customerMoney: null, //玩家钱数
//             tableNum: null,   //当前桌号
//             onlineNum: null,  //在线人数
//             customerId: null,
//             countDown: null,
//             initNetwork: function () {
//                 cc.log('Network initSocket...');
//                 var host = "ws://localhost:4001";
//                 //this.testhost = "ws://echo.websocket.org"  
//                 this.socket = new WebSocket(host);
//                 this.socket.onopen = function (evt) {
//                     cc.log('Network onopen...');
//                     //utils.outObj(evt);  
//                     this.isInit = true;
//                 }.bind(this);

//                 this.socket.onmessage = function (evt) {
//                     var msg = evt.data;
//                     cc.log('Network onmessage...');

//                     var dataObj = JSON.parse(msg);
//                     cc.log(dataObj);
//                     this.msg = dataObj;
//                     this.customerMoney = dataObj.customerMoney || this.customerMoney;
//                     this.tableNum = dataObj.tableNum || this.tableNum;
//                     this.onlineNum = dataObj.onlineNum || this.onlineNum;
//                     this.customerId = dataObj.customerId || this.customerId;
//                     this.countDown = dataObj.countDown || this.countDown;
//                     this.appandeMsg(this.method, dataObj);
//                 }.bind(this);

//                 this.socket.onerror = function (evt) {
//                     cc.log('Network onerror...');
//                     //utils.outObj(evt);  
//                 };

//                 this.socket.onclose = function (evt) {
//                     cc.log('Network onclose...');
//                     //utils.outObj(evt);  
//                     this.isInit = false;
//                 }.bind(this);
//             },
//             send: function (data) {
//                 if (!this.isInit) {
//                     cc.log('Network is not inited...');
//                 } else if (this.socket.readyState == WebSocket.OPEN) {
//                     var tdata = JSON.stringify(data);
//                     cc.log('Network send:' + tdata);
//                     this.socket.send(tdata);
//                 } else {
//                     cc.log('Network WebSocket readState:' + this.socket.readyState);
//                 }
//             },
//             close: function () {
//                 if (this.socket) {
//                     cc.log("Network close...");
//                     this.socket.close();
//                     this.socket = null;
//                 }
//             },
//             getMsg: function () {
//                 return this.msg;
//             },

//             //接受数据
//             appandeMsg: function (method, data) {
//                 if (data.code == "0") {
//                     cc.log("reqFail");
//                     if (method === "login" || method === "loginByPhone")
//                         this.game.showMsg(data.msg);
//                     else this.game.requireFail();
//                     return;
//                 }
//                 switch (method) {
//                     case "login":
//                     case "loginByPhone":
//                         cc.director.loadScene('game', function () {
//                             cc.log("进入游戏");
//                         });
//                         break;
//                     case "userBets":
//                         //this.game.waitDeal();
//                         break;
//                     case "changeTable":
//                         this.game.getComponent('menuCallback').waitChange();
//                         break;
//                     case "loginOut":
//                         cc.director.loadScene('start', function () {
//                             cc.log("退出");
//                         });
//                         break;
//                     case "resultData":
//                         this.game.getComponent('menuCallback').waitHistory();
//                         break;
//                     case "userGive":
//                         this.game.getComponent('menuCallback').giveCoinHandler();
//                         break;
//                     case "getActionCard":
//                         this.game.waitPut();
//                         break;
//                 }
//             },
//             //发送接口
//             // //登陆
//             onLogin: function (pid, psd) {
//                 // this.send({"method":"login","openId":"123456"});
//                 // this.method = "login";
//                 this.send({ "method": "loginByPhone", "phone": pid, "passWord": psd });
//                 this.method = "loginByPhone";
//             },

//             //下注
//             onUseBets: function (id, zNum, xNum, hNum, tableNum, lotteryRecordId) {
//                 this.send({
//                     "method": "userBets",
//                     "customerId": this.customerId + "",
//                     "zbetsNum": zNum + "",
//                     "xbetsNum": xNum + "",
//                     "hbetsNum": hNum + "",
//                     "tableNum": tableNum + "",
//                     "lotteryRecordId": lotteryRecordId + ""
//                 });
//                 this.method = "userBets";
//             },
//             //换桌
//             onChangeTable: function () {
//                 this.send({ "method": "changeTable", "reTableId": this.tableNum + "" });
//                 this.method = "changeTable";
//             },
//             //路单
//             onHistory: function (tableNum) {
//                 this.send({ "method": "resultData", "tableNum": tableNum + "" });
//                 this.method = "resultData";
//             },
//             //赠送
//             onGive: function (phoneId, value) {
//                 this.send({
//                     "method": "userGive", "customerId": this.customerId + "",
//                     "phone": phoneId + "", "giveMoney": value + ""
//                 });
//                 this.method = "userGive";
//             },
//             //退出登陆

//             onLoginOut: function () {
//                 this.send({ "method": "loginOut" });
//                 this.method = "loginOut";
//             },
//             //发牌
//             onPutCard: function (ltid, csid) {
//                 this.send({ "method": "getActionCard", "lotteryRecordId": ltid + "", "customerId": csid + "" });
//                 this.method = "getActionCard";
//             }
//         };
//         return networkInstance;
//     }
//     return {
//         getInstance: function () {
//             if (instance === null) {
//                 instance = getNetworkInstance();
//             }
//             return instance;
//         }
//     };
// })();


// module.exports = {
//     Network: Network
// };
