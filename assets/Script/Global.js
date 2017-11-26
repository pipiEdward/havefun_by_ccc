
//读取图片纹理
var getRealUrl = function(url){
    return cc.url.raw(url);
}

//修改spriteFrame
var setSpriteFrameByUrl = function(sprite,url){
    cc.log(getRealUrl(url));
    var texture = cc.textureCache.addImage(getRealUrl(url));
    sprite.spriteFrame.setTexture(texture);
}

//随机值
function getRandom(min, max) {
    return Math.random() * (max - min) + min;   
}
function getRandomInt(min,max) {
     return Math.floor(Math.random() * (max - min)) + min;
}

var isMobile = function () {
    return cc.sys.isMobile;
};


module.exports = {
    isMobile: isMobile,
    setSpriteFrameByUrl:setSpriteFrameByUrl,
    getRealUrl:getRealUrl,
    getRandom:getRandom,
    getRandomInt:getRandomInt
};