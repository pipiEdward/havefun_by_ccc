cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {

    },
    init:function (type) {
        var url = "ludanLayer/img_"+type;
        var img = this.getComponent(cc.Sprite);
        cc.loader.loadRes(url, cc.SpriteFrame, function (error, spriteFrame) {
            if (!error) {
                img.spriteFrame = spriteFrame;
            }
        });
        
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
