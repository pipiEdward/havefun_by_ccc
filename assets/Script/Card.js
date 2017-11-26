
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
    },
    
    init:function(type,id){
        var url = "card/"+type+"_"+id;
        var img = this.getComponent(cc.Sprite);
        cc.loader.loadRes(url, cc.SpriteFrame, function (error, spriteFrame) {
            if (!error) {
                img.spriteFrame = spriteFrame;
            }
        });
        
        //Global.setSpriteFrameByUrl(img,url);

    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
