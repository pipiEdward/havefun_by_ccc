var Network = require("Network").Network;
cc.Class({
    extends: cc.Component,

    properties: {
        nameLabel:cc.Label,
        idLabel:cc.Label,
        coinLabel:cc.Label,
        money:9000
    },

    // use this for initialization
    onLoad: function () {
        this.name = null;
        this.id = null;
    },
    //设置用户用户名和id
    initInfo:function(name,id){
        this.id = id;
        this.name = name;
        this.nameLabel.string = name;
        this.idLabel.string = "id:"+id;
    },
    changeMoney:function(money){
        var mon = 0;
        var curM = this.money;
        this.money+=money;
        var dir = money/Math.abs(money);
        // this.schedule(function(s) {
        //     if(mon == money){
        //         return;
        //     }
        //     curM+=dir*10;
        //     this.coinLabel.string = curM;
        //     mon+=dir*10;
        // },0.01);
        this.coinLabel.string = this.money;       
    },
    refreshCoinLabel:function () {          
        this.money = Network.getInstance().customerMoney>>0;
        this.coinLabel.string = this.money;
    }
    
    

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
