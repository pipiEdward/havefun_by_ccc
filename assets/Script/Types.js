// 输赢
var Outcome = cc.Enum({
    Win: -1,
    Lose: -1,
    Tie: -1,
});



//牌属性

function Card(type,num) {
    this.type = type;
    this.num = num;
    this.id = (type - 1) * 13 + (num - 1);
    this.score = this.num<10?this.num:0;
}

var cards = new Array(52);

//初始化所有的牌
(function createCards () {
    for (var s = 1; s <= 4; s++) {
        for (var p = 1; p <= 13; p++) {
            var card = new Card(s, p);
            cards[card.id] = card;
        }
    }
})();

Card.fromId = function (id) {
    return cards[id];
};


module.exports = {
    Card:Card,
    Outcome:Outcome,
}


