const RedisClient = require('./redisConnect.js');

var request = require('request');
var querystring = require("querystring");
var appid = "wx23ab52eb69b7e1c4";
var appsecret = require('./APPSecret');

const TOKEN = {
    /**
     * 保存在redis里面的token键名
     * @type {string}
     */
    NAME: 'WECHAT-ACESSTOKEN',
    /**
     * access_token有效期，默认两个小时
     * @type {number}
     */
    EXPIRY_DATE : 60 * 60 * 2 * 1000,
};

function TokenService() {
}

/**
 * 获取有效的access_token，附于所有微信接口请求
 * @returns {Promise<any>}
 */
TokenService.getAccessToken = async () => {
	// 从redis同步获取键值并赋值
    let token = await RedisClient.synGet(TOKEN.NAME);
    console.log(token);
    return token;
};

//获得小程序AcessToken
var getAccessToken = async () =>{
    var context = {
        grant_type: "client_credential",
        appid: appid,
        secret: appsecret
    }
    var opts = {
        method: 'GET',
        url: "https://api.weixin.qq.com/cgi-bin/token?" + querystring.stringify(context)
    }

    request(opts, (err,res,body)=>{
        if (!err && res.statusCode == 200) {
            var bodyToken=JSON.parse(body);
            console.log("bodyToken");
            console.log(bodyToken);

            if(bodyToken&&bodyToken.access_token){
                setToken(bodyToken.access_token);
            }
        }
    })
}

var setToken = function(accessToken){
    if(accessToken){
        RedisClient.set("WECHAT-ACESSTOKEN",accessToken);
        
        // var result = await client.get("WECHAT-ACESSTOKEN",function(err,result){
        //     if(err){
        //         console.log(err);
        //     }else{
        //         // const sdf = result
        //         // console.log(result);
        //     }
        // })
        // console.log(result);
    }
}

var period = 6900000;   // 1h55m
getAccessToken();
// console.log(client.get("WECHAT-ACESSTOKEN"))
setInterval(getAccessToken,period);

module.exports = TokenService;