const fs = require('fs');
const path = require('path');

let privateKeyPath = path.resolve(__dirname, '../private-key.pem');
let publicKeyPath = path.resolve(__dirname, '../public-key.pem');
// console.log(privateKeyPath)
// 这里配置基本信息
const AlipayBaseConfig ={
    appId: '2021000116693744',
    privateKey: fs.readFileSync(privateKeyPath, 'ascii'),
    gateway: 'https://openapi.alipaydev.com/gateway.do',
    alipayPublicKey: fs.readFileSync(publicKeyPath, 'ascii'),
};


module.exports = {
    AlipayBaseConfig: AlipayBaseConfig,	// 将配置模块暴露供初始化调用
}