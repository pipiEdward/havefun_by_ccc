'use strict'

const serverName = 'hf';
const webSocketServer = require('ws').Server;
let wss = null;

function hook(ws, _open, _message, _close, _error) {
	ws.on('open', _open);
	ws.on('message', _message);
	ws.on('close', _close);
	ws.on('error', _error);
};

function log(...value){
	console.log(serverName,...value);
}

exports.start = () => {
	log('ws start');
	wss = new webSocketServer({ port: 4001 });
	wss.on('connection', (ws) => {
		log('client connected');
		//log(wss.clients.size);
		hook(ws,
			onOpen.bind(ws),
			onMessage.bind(ws),
			onClose.bind(ws),
			onError.bind(ws));
	});
};
exports.start();

function onOpen(event) {
	log('open');

};

function onMessage(event) {
	let self = this;
	let msg = parseJson(event);
	log(msg);
	if (msg && msg.f) {
		switch (msg.f) {
			case 'login':
				onLogin.call(self, msg);
				break;
			case 'send':
				onSend.call(self, msg);
			default:
				break;
		}
	} else {
		log('bad package');
	}
};

function onClose(event) {
	log(wss.clients.size);
	//发送广播
	broadcast({
		f: 'quit',
		msg: {
			userName: this.userName,
			userNum: wss.clients.size,
		}
	});
	log('onClose');
};

function onError(event) {
	log('onError');
};

//广播  
function broadcast(msg) {
	// log(ws);  
	wss.clients.forEach(function (client) {
		client.send(stringifyJson(msg));
	});
};


//将时间转换成时：分：秒
function parseTime(value) {
	var hour = value.getHours();
	var minute = value.getMinutes();
	var second = value.getSeconds();
	var hourStr = hour < 10 ? '0' + hour : hour;
	var minuteStr = minute < 10 ? '0' + minute : minute;
	var secondStr = second < 10 ? '0' + second : second;
	return hourStr + ':' + minuteStr + ':' + secondStr;
};


//字符串转json
function parseJson(s) {
	try {
		return JSON.parse(s);
	} catch (e) { }
};

//json转字符串
function stringifyJson(j) {
	try {
		return JSON.stringify(j);
	} catch (e) { }
};

//检测变量是否存在
function checkExist(obj) {
	return typeof obj != 'undefined';
};