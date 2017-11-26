var Game = require('Game');
var Types = require('Types')

cc.Class({
    extends: cc.Component,

    properties: {
        tableIdLabel:cc.Label,
        onlineLabel:cc.Label,

        //发牌摆放的位置
        layPlace:{
            default:[],
            type:[cc.Node]
        },

        //各区域投掷筹码总金额
        lableChipArr:{
            default:[],
            type:[cc.Label],
        },

        //两家点数
        scoreLabelsArr:{
            default:[],
            type:[cc.Label]
        },
        //
        lastResult:0
    },

    // use this for initialization
    onLoad: function () {
        this.tableId = 0;
        
    },
    
    setDeskId:function(desk_id){
        this.tableIdLabel.string = desk_id;
        this.tableId = desk_id;
    },
    setOnline:function (num) {
        this.onlineLabel.string = num;
    },

    //重置牌 
    resetCards:function () {
        this.cardsCount = 4;
        this.allCards = new Array(52*this.cardsCount);
        var index = 0;
        var fromId = Types.Card.fromId;
        for (var i = 0; i < this.cardsCount; ++i) {
            for (var cardId = 0; cardId < 52; ++cardId) {
                this.allCards[index] = fromId(cardId);
                ++index;
            }
        }
    },

    //刷新数据
    refreshData:function () {
        this.typeCoin = [0,0,0];    //桌面上各个区域金额总数（0：庄，1：闲，2：和）
        for(var i = 0;i<this.lableChipArr.length;i++){
            this.chipLabelChange(i,0);
        }
        this.actorScore = [0,0];
        this.actorCardsCount = [0,0];
        this.scoreLabelsArr[0].enabled = false;
        this.scoreLabelsArr[1].enabled = false;
        this.scoreLabelsArr[0].string = 0;
        this.scoreLabelsArr[1].string = 0;
    },
    
    //chou牌
    dealCard:function(){
        var allCards = this.allCards;
        var len = allCards.length;
        if(len === 0){
            return null;
        }

        var random = Math.random();
        var index = (random * len) | 0;
        var result = allCards[index];

        // 保持数组紧凑
        var last = allCards[len - 1];
        allCards[index] = last;
        allCards.length = len - 1;
  

        return result;
    },

    //绘制牌
    drawCard:function(pId,card){
        //var result = this.dealCard();
        var type,num,score;
        if(card.color == "黑桃"){
            type = 1;
        }else if(card.color == "红桃"){
            type = 2;
        }else if(card.color == "梅花"){
            type = 3;
        }else if(card.color == "方块"){
            type = 4;
        }

        if(card.number == "A"){
            num = 1;
        }else if(card.number == "J"){
            num = 11;
        }else if(card.number == "Q"){
            num = 12;
        }else if(card.number == "K"){
            num = 13;
        }else{
            num = parseInt(card.number);
        }   
        score = num>=10?0:num;
        //if(result){
        var newCard = cc.instantiate(Game.instance.cardPrefab);
        newCard.getComponent('Card').init(type,num);
        this.layPlace[pId].addChild(newCard);
        Game.instance.cardsOutArr.push(newCard);
        //}

        //玩家牌++
        this.actorCardsCount[pId]++;

        //计算点数
        this.scoreLabelsArr[0].enabled = true;
        this.scoreLabelsArr[1].enabled = true;
        
        this.actorScore[pId] = (this.actorScore[pId]+score)%10;
        this.lastResult = score;

        this.scoreLabelsArr[pId].string = this.actorScore[pId];
    },
    
    //改变桌面筹码
    chipLabelChange:function (type,money) {       
        this.typeCoin[type]+=money;
        this.lableChipArr[type].string = "$"+this.typeCoin[type];
        this.lableChipArr[type].fontSize = 35;
        this.scheduleOnce(function(dt) {
            this.lableChipArr[type].fontSize = 30;
        },0.3);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
