var Types = require("Types");
var Global = require("Global");
var Network = require("Network").Network;
//游戏状态
var GameState = {
    STAKE:1,    //押注
    DEAL:2,     //发牌
    RESULT:3,   //比牌结算
};

//押注类型
var StakeType = {
    Zhuang:0,
    Xian:1,
    He:2
}

//
var Actor = {
    ZJ:0,
    XJ:1
}

//发牌目标
var CardTarget = {
    Z:0,
    X:1
}

var Game = cc.Class({
    extends: cc.Component,
    properties: {
        bg:cc.Node,
        timeLabel:{
            default:null,
            type:cc.Label
        },
        touchColl:{
            //桌子触摸碰撞区域
            default:[],
            type:cc.PolygonCollider
        },
        chipArr:{
            //可选择的筹码
            default:[],
            type:cc.Node
        },
        chipPos:{
            default:[],
            type:cc.Node
        },
        cardPrefab: cc.Prefab,
        outChipPrefab:cc.Prefab,
        historyPrefab:cc.Prefab,
        historyLayer:cc.Node,
        winTimeLabels:{
            default:[],
            type:cc.Label
        },

        chooceSp:cc.Node,
        resultLabel:{
            default:[],
            type:cc.Sprite,   //游戏结果标签
        },
        gameNum:0,

        customId:0,
        tableNum:0,
        onlineNum:0,
        lotteryRecordId:0,
        //最大下注
        maxSet: 2000,

        tipLayer:cc.Node,
        loadCircle:cc.Node,
        infoLabel:cc.Label      //弹窗信息
    },
    
    statics: {
        instance: null
    },

    // use this for initialization
    onLoad: function () {
        Game.instance = this;
        Network.getInstance().game = this;

        this.desk = this.getComponent('Desk');
        this.popWindows = this.getComponent('menuCallback').popWindows;
        this.player = this.getComponent('Player');

        var msg =  Network.getInstance().getMsg();
        this.customId = msg.customerId;
        this.initPlayer("pipiEdward",this.customId);

        cc.director.getCollisionManager().enabled = true;

        this.gameStart();
        
    },
    refreshRoomMsg:function () {
        var msg =  Network.getInstance().getMsg();
        this.lotteryRecordId = msg.lotteryRecordId;
        this.onlineNum = msg.onlineNum;
        this.tableNum = msg.tableNum;
    },
    refreshTableMsg:function () {
        this.requestTime = 0;
        var msg =  Network.getInstance().getMsg();
    },

    //初始化玩家
    initPlayer:function(name,id){
        this.player.initInfo(name,id);
    },
    //游戏开始
    gameStart:function(){
        this.chipOutArr = [];   //桌面筹码容器
        this.chooceSp.setPosition(this.chipArr[0].getPosition());
        this.chipArr[0].scale = 1.2;
        this.chooceSp.parent = this.chipArr[0].parent;
        this.curChipId = 0;
        this.cardsOutArr = [];  //桌面牌容器
        
        this.addLis();
        
        this.resetTable();
        this.resetTime();
    },

    
    //重启桌子
    resetTable:function(){
        this.refreshRoomMsg();
        this.gameNum = 0;
        this.winTime = [0,0,0,0]; //三种结果的次数
        for(var i = 0;i<4;i++){
            this.winTimeLabels[i].string = 0;
        }

        //桌号
        this.desk.resetCards();
        this.desk.setDeskId(this.tableNum);
        //在线人数
        this.desk.setOnline(this.onlineNum);
        
        this.refreshTable();
    },
    //刷新桌面
    refreshTable:function () {
        this.refreshTableMsg();
        this.unscheduleAllCallbacks();
        this.gameState = GameState.STAKE;

        this.player.refreshCoinLabel();
        //清空桌面筹码
        for(var i = this.chipOutArr.length-1;i>=0;i--){
            this.chipOutArr[i].c.destroy();
        }
        this.chipOutArr = [];
        
        //清空桌面金额数据和牌面点数
        this.desk.refreshData();

        //清空桌面牌
        for(var j = this.cardsOutArr.length-1;j>=0;j--){
            this.cardsOutArr[j].destroy();
        }
        this.cardsOutArr = [];

        //隐藏结果
       for(var k = 0;k<5;k++){
            this.resultLabel[k].enabled = false;
       }

        //先发闲家的牌
        this.actor = Actor.XJ;

        //提示下注
        this.resultLabel[3].enabled = true;
        this.scheduleOnce(function (dt) {
            this.resultLabel[3].enabled = false;
        },1);

        this.actionCard = [];
    },
    resetTime: function(){
        var countDown = Network.getInstance().countDown
        //重置时间
        this.timeCount = (countDown===0)?30:countDown;
        this.timeCount = parseInt(this.timeCount);
        this.timeLabel.string = this.timeCount;
        //this.unschedule(this.timeDown);
        this.schedule(this.timeDown,1,100,1);
    },
    
    addLis:function(){
        this.node.on(cc.Node.EventType.TOUCH_END,function(event){
                var pos = event.getLocation();
                //选择筹码
                for(var a = 0;a<this.chipArr.length; a++){
                    var cp = this.chipArr[a];
                    var realPos = cp.convertToWorldSpaceAR(cc.p(0,0));
                    if(cc.rectContainsPoint(cc.rect(realPos.x-cp.width/2,realPos.y-cp.height/2,cp.width,cp.height), pos)){
                        this.chooceChip(a);
                    }
                }
                if(this.gameState!=GameState.STAKE){
                    return false;
                }
                //点击下注
                for(var i = 0;i<this.touchColl.length;i++){
                    if(cc.Intersection.pointInPolygon(pos, this.touchColl[i].world.points)){
                        cc.log(this.touchColl[i].tag);
                        this.dealChip(this.touchColl[i].tag,pos);
                    }
                }
                return true;
        },this);
    },
    

    //倒计时cs
    timeDown:function(dt){ 
        if(this.timeCount <= 0){
            cc.log("时间到，开始发牌");
            this.unschedule(this.timeDown);
            this.gameState = GameState.DEAL;

            //发送下注接口
            var z = this.desk.typeCoin[0];
            var x = this.desk.typeCoin[1];
            var h = this.desk.typeCoin[2];
            if(!(z === 0 && x === 0 && h === 0)){
                Network.getInstance().onUseBets(this.customId,z,x,h,this.tableNum,this.lotteryRecordId);
            }

            
            this.conn = false;
            this.node.runAction(cc.sequence(cc.delayTime(1),cc.callFunc( function () {
                if(!this.conn){
                    this.loadCircle.active = true;
                    this.loadCircle.runAction(cc.repeatForever(cc.rotateBy(1,180)));
                }
 
                },this)
            
            ))
            // this.popWindows.active = true;
            // this.dealCards();
            this.waitDeal();
            return;
        }
        this.timeCount-=1;
        this.timeLabel.string = this.timeCount;
    },
    //等待下注回应
    waitDeal:function () {
        if(this.requestTime >= 5 ){
            this.requireFail();
            return;
        }
        this.requestTime++;
        this.scheduleOnce(function () {
            Network.getInstance().onPutCard(this.lotteryRecordId,this.customId);
        },1);

        
    },
    waitPut:function () {
        var msg = Network.getInstance().getMsg();
        if(!msg.actionCard){
            this.waitDeal();
            return;
        }
        this.conn = true;
        this.loadCircle.stopAllActions();
        this.loadCircle.active = false;
        this.round = 1;
        this.lotteryRecordId = msg.lotteryRecordId;
        this.actionCard = JSON.parse(msg.actionCard);
        this.cardResult = msg.whoWin;
        this.schedule(this.dealCards,1,10,0.5); //开始发牌
    },
    
    //选择筹码
    chooceChip:function(id){
        for(var i = 0;i<this.chipArr.length;i++){
            if(i == id){
                this.chooceSp.setPosition(this.chipArr[i].getPosition());
                this.chipArr[i].scale = 1.2;
                this.curChipId = id;
            }else{
                this.chipArr[i].scale = 1;
            }
        }
    },
    
    //点击下注
    dealChip:function(type,p){
        var m = [10,50,100,500,1000];
        var money = m[this.curChipId];
        var v = this.desk.typeCoin[type-1]+money;
        var n = ["庄","闲","和"];
        if(v > this.maxSet){
            this.showPop(true, n[type-1]+"下注不能超过"+this.maxSet, function(){});
            return;
        }
        //检测钱不足
        if(this.player.money<money){
            cc.log("钱不足");
            this.showPop(true,"您的余额不足",function () {});
            return;
        }

        var newChip = cc.instantiate(this.outChipPrefab);
        var pos = this.chipArr[this.curChipId].convertToWorldSpaceAR(cc.p(0,0));
        newChip.setPosition(pos.x-this.node.width/2,pos.y-this.node.height/2);
        newChip.getComponent('Chip').init(money,type-1);
        this.bg.addChild(newChip);
        var chip = {
            c:newChip,
            t:type-1
        }
        this.chipOutArr.push(chip);        
        // var posNode = this.chipPos[type-1];
        // var ranPosX = Global.getRandom(posNode.x-posNode.width/2, posNode.x+posNode.width/2);
        // var ranPosY = Global.getRandom(posNode.y-posNode.height/2, posNode.y+posNode.height/2);
        newChip.runAction(cc.spawn(cc.moveTo(0.2,cc.p(p.x-this.node.width/2,p.y-this.node.height/2)),cc.scaleTo(0.2,0.5)));

        this.addChipV(type,money);

    },
    //改变各区域下注金额
    addChipV:function(type,money) {
        this.player.changeMoney(-money);
        this.desk.chipLabelChange(type-1,money);
    },
    
    //发牌
    dealCards:function(dt){
        //各发两张牌
        var who = this.whoGetCard();
        if(who == null){
            //比牌
            this.unschedule(this.dealCards);
            this.checkResult();
            return;
        }  
        var card;
        if(who === Actor.ZJ){
            if(this.round===2) card = this.actionCard[0];
            else card = this.actionCard[1];
        }else if(who === Actor.XJ){
            if(this.round===3) card = this.actionCard[2];
            else card = this.actionCard[3];
        }
           
        this.desk.drawCard(who,card);
    },

    whoGetCard:function () {
        if(this.round == 2||this.round == 4){
            this.round++;
            return Actor.XJ;
        }

        if(this.round == 1||this.round == 3){
            this.round++;
            return Actor.ZJ;
        }
        if(this.round>4){
            return null;
        }

        var score = this.desk.actorScore;
        var count = this.desk.actorCardsCount;


        //如果闲家摸到3张牌
        if(count[Actor.XJ]==3&&count[Actor.ZJ]<3){
            var thirdNum = this.desk.lastResult;   //闲家第三张牌的值
            //庄家的总点数是 0，1，2：庄家总是拿第三张牌
            if(score[Actor.ZJ] == 0||score[Actor.ZJ] == 1||score[Actor.ZJ] == 2){
                return Actor.ZJ;
            }
            //庄家的总点数是 3：如果玩家的第三张牌是除了8以外的任何牌，庄家就抽第三张牌。
            if(score[Actor.ZJ] == 3&&thirdNum != 8){
                return Actor.ZJ;
            }
            //庄家的总点数是 4：如果玩家的第三张牌是 2-3-4-5-6-7 ，庄家就继续拿牌
            if(score[Actor.ZJ] == 4&&(thirdNum>=2&&thirdNum<=7)){
                return Actor.ZJ;
            }
            //庄家的总点数是 5：如果玩家的第三张牌是 4-5-6-7 ，庄家就继续拿牌。
            if(score[Actor.ZJ] == 5&&(thirdNum>=4&&thirdNum<=7)){
                return Actor.ZJ;
            }
            //庄家的总点数是 6：如果玩家的第三张牌是 6-7，庄家就继续拿牌。
            if(score[Actor.ZJ] == 6&&(thirdNum>=6&&thirdNum<=7)){
                return Actor.ZJ;
            }
            return null;
        }

        if(count[Actor.ZJ]<3){
          //如果庄家或者闲家摸到好牌
            if(score[Actor.ZJ]>=8||score[Actor.XJ]>=8){
                //停牌比牌
                return null;
            } 
            //如果闲家的总数是 6 或者 7，那么闲家就停止进牌。
            if(score[Actor.XJ]>=6){
                //庄家的牌小于等于5就庄家继续进牌。
                if(score[Actor.ZJ]<6){
                    return Actor.ZJ;
                }else{
                    return null;
                }
            }
            return Actor.XJ;
        }
    },


    //比较大小
    checkResult:function() {
        var score = this.desk.actorScore;
        // var result,resultString,money;
        // if(score[Actor.XJ]>score[Actor.ZJ]){
        //     result = StakeType.Xian;
        //     resultString = 'Player win';
        // }else if(score[Actor.XJ]<score[Actor.ZJ]){
        //     result = StakeType.Zhuang;
        //     resultString = 'Banker win';
        // }else{
        //     result = StakeType.He;
        //     resultString = 'Draw';
        // }

        var result = parseInt(this.cardResult)-1
        //显示游戏结果
        this.resultLabel[result].enabled = true;

        this.scheduleOnce(function (s) {
            this.checkWin(result);
        },1)

    },
    //检测是否赢钱
    checkWin:function (result) {
        var winSize= cc.winSize;
        //飞钱
        for(var a = 0;a<this.chipOutArr.length;a++){
            var chip = this.chipOutArr[a].c;
            var action;
            if(this.chipOutArr[a].t == result){
                action = cc.moveTo(0.5,cc.p(0,-winSize.height/2-100));
            }else{
                action = cc.moveTo(0.5,cc.p(0,winSize.height/2+100));
            }
            chip.runAction(action);
        }
        this.player.refreshCoinLabel();
        
        // //结算
        // var money = 0;
        // for(var i = 0;i<3;i++){
        //     if(i == result){
        //         money+= result == StakeType.He?this.desk.typeCoin[result]*9:this.desk.typeCoin[result]*2;
        //     }
        // }
        // this.player.changeMoney(money);



        // //添加历史记录
        // var history = cc.instantiate(this.historyPrefab);
        // history.getComponent('History').init(result-1);
        // this.historyLayer.addChild(history);
        // //改变路单界面数据
        // this.winTime[0]++;
        // this.winTime[result]++;
        // this.winTimeLabels[0].string = this.winTime[0];
        // this.winTimeLabels[result].string = this.winTime[result];

        this.scheduleOnce(function (dt) {
            //刷新桌子
            this.node.runAction(cc.sequence(cc.delayTime(1),cc.callFunc(function () {
                this.refreshTable();
                this.resetTime();
            },this)));
        },1);


    },
    waitHistory:function () {
        //清理路单
        this.historyLayer.removeAllChildren();
        this.winTime = [0,0,0,0];

        var resultData = Network.getInstance().getMsg().resultData;
        var length = resultData.length;
        for(var s = 0;s<length;s++){
            var result = resultData[s].lotteryResult;
            var history = cc.instantiate(this.historyPrefab);
            history.getComponent('History').init(result-1);
            this.historyLayer.addChild(history);
            this.winTime[0]++;
            this.winTime[result]++;
            this.winTimeLabels[0].string = this.winTime[0];
            this.winTimeLabels[result].string = this.winTime[result];
        }
    },

    //请求服务器失败
    requireFail:function () {
        this.showPop(true,"请求服务器失败",function () {
            cc.director.runScene("start");
        });
    },

    //显示提示
    showTip:function (show,tip) {
        this.tipLayer.active = show;
        if(show){
            this.tipLayer.getChildByName("label_tip").getComponent(cc.Label).string = tip;  
        }
    },
    //显示弹窗
    showPop:function (show,info,callBack) {
        this.getComponent('menuCallback').changeOkEvent(callBack);
        this.loadCircle.stopAllActions();
        this.loadCircle.active = false;
        this.conn = true;
        this.popWindows.active = show;
        if(show){
            this.infoLabel.string = info;
        }
    }
});