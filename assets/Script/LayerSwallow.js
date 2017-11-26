cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches:true,
            onTouchBegan:function(t,e){
                return true;
            }
            
        },this.node);
        
        this.node.setLocalZOrder(10);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});