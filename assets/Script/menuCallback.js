var Game = require('Game');
var Network = require('Network').Network;

cc.Class({
    extends: cc.Component,

    properties: {
        popWindows:{
            default:null,
            type:cc.Node,
        },
        ruleWindows:{
            default:null,
            type:cc.Node,
        },
        ludanWindows:{
            default:null,
            type:cc.Node,
        },
        giveWindows:{
            default:null,
            type:cc.Node,
        },
        loadCircle:cc.Node,
        phoneId: cc.EditBox,
        coinValue: cc.EditBox,
    },

    // use this for initialization
    onLoad: function () {

    },
    //赠送金币
    giveCoin:function(){
        this.giveWindows.active = true;
    },
    //赠送金币
    giveCoinHandler:function(){
        Game.instance.showPop(true,"赠送金额成功",function(){});
        this.getComponent('Player').refreshCoinLabel();
    },
    //赠送金币
    giveCoinFun:function(){
        if(!this.phoneId.string){
            Game.instance.showPop(true,"手机号码不能为空",function(){});
            return;
        }
        if(!this.coinValue.string){
            Game.instance.showPop(true,"赠送金额不能为空",function(){});
            return;
        }
        if(parseInt(this.coinValue.string)>100000 || parseInt(this.coinValue.string)<100){
            Game.instance.showPop(true,"赠送金额范围为100-100000",function(){});
            return;
        }
        this.giveWindows.active = false;
        Network.getInstance().onGive(this.phoneId.string, this.coinValue.string);
    },
    //退出微信登陆，返回到首界面
    quiteWx:function(){
        Network.getInstance().onLoginOut();
        this.loadActive(true);
    },
    
    //弹出规则页面
    popRuleWindows:function(){
          this.ruleWindows.active = true;
    },
    
    //弹出路单页面
    popLudanWindows:function(){
        //发送路单接口
        Network.getInstance().onHistory(Game.instance.tableNum);        
        this.loadActive(true);
    },
    waitHistory:function () {
        this.ludanWindows.active = true;
        Game.instance.waitHistory();
        this.loadActive(false);
    },
    
    //关闭按钮,关闭弹窗
    closeWindows:function(event){
        var node = event.target;
        node.parent.active = false;
    },

    //换桌
    changeDesk:function() {
        //发送服务器换桌
        Network.getInstance().onChangeTable();
        this.loadActive(true);
        Game.instance.unscheduleAllCallbacks();

    },
    waitChange:function () {
        Game.instance.resetTable();
        Game.instance.resetTime();
        this.loadActive(false);
    },
    /**
     * load动画
     */
    loadActive: function(model){
        if(model){
            this.loadCircle.active = true;
            this.loadCircle.runAction(cc.repeatForever(cc.rotateBy(1, 180)));
        }else{            
            this.loadCircle.active = false;
        }
    },
    /**
     * 改变确定按钮的点击回调方法
     */
    changeOkEvent: function(fun){
        this.okFun = fun;
    },
    quite:function(){
        //cc.director.loadScene('start');
        this.popWindows.active = false;
        this.okFun?this.okFun():cc.director.loadScene('start');
    }
    
    
    
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
