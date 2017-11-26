var NetworkComponent = cc.Class({
    extends: cc.Component,

    properties: {
    },
    onLoad: function () {
        
        NetTarget.on('net', this.getNetData,this);
        NetTarget.on('netstart', this.netStart,this);
        NetTarget.on('netclose', this.netClose,this);
        NetTarget.on('neterror', this.netError,this);
    },
    onDestroy: function () {
        cc.log('destroy');
        NetTarget.off('net', this.getNetData,this);
        NetTarget.off('netstart', this.netStart,this);
        NetTarget.off('netclose', this.netClose,this);
        NetTarget.off('neterror', this.netError,this);
    },
    /**
     * 获取服务端数据
     */
    getNetData: function (event) {
        cc.log("append");
    },
    /**
     * 网络连接开始
     */
    netStart: function (event) {
        cc.log("net start");
    },
    /**
     * 网络断开
     */
    netClose: function (event) {
        cc.log("net close");
    },

    //连接错误
    netError:function(event){
        cc.log("net error");
    },


});
