
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {

    },
    
    init:function(num,type){
        var url = "chip/c"+num
        var img = this.getComponent(cc.Sprite);
        cc.loader.loadRes(url, cc.SpriteFrame, function (error, spriteFrame) {
            if (!error) {
                img.spriteFrame = spriteFrame;
            }
        });
        this.type = type;
        
        //Global.setSpriteFrameByUrl(img,url);

    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

