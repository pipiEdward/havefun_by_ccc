cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        //this.button = this.getCompoment(cc.Button);
        this.scaleDownAction = cc.scaleTo(0.1, 1.1);
        this.scaleUpAction = cc.scaleTo(0.1,1);
        
        var self = this;
        function onTouchDown(event){
            this.stopAllActions();
            this.runAction(self.scaleDownAction);
        }
        function onTouchUp(event){
            this.stopAllActions();
            this.runAction(self.scaleUpAction);
        }
        this.node.on('touchstart',onTouchDown,this.node);
        this.node.on('touchend',onTouchUp,this.node);
        this.node.on('touchcancel',onTouchUp,this.node);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
