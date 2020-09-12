var jwt = require('jwt-simple');
var url = require('url');
var client = require("../redisConnect.js");

const secret = "jiankangyiliao";
function checkToken(req, res, next) {

    // client.on('ready', function (res) {
    //     console.log('redis-ready');
    // });
    console.log("url " + req.url);
    const path = url.parse(req.url, true).pathname
    //console.log(`url ${path}`)
    //console.log(path != '/patients/sessions' && path !='/doctors/sessions')
    if ( !((path == '/patients/sessions' || path == '/doctors/sessions') && req.method == 'POST') ) {
        let tokenclone = req.headers.authorization;
        console.log(tokenclone);
        if (tokenclone) {
            var decoded = jwt.decode(tokenclone, secret);
            console.log("decoded name: " + decoded.username);
            // var getname = querystring.stringify(decoded);
            // console.log("getname:"+getname);

            //从redis得到用户名对应token
            //var gettoken = client.get(decoded.username, redis.print);这句代码存在异步问题，必须用回调函数
            //console.log("getted token: "+gettoken);
            client.get(decoded.username, (err, val) => {
                if (err) console.log(err)
                const gettoken = val
                // var gettoken = querystring.stringify(client.get(decoded.username,redis.print)).split(' ')[1];
                console.log("gettoken " + gettoken);
                if (gettoken) {
                    if (Date.now() > decoded.expires) {
                        res.status(403).json({
                            code: '403',
                            message: '登录过期'
                        })
                        client.del(req.username,function(err,reply){
                            if (err) return false;
                            console.log(reply);
                        });
                        console.log("登录过期，将redis里对应的token删除");
                        res.send({message: "登录过期，请重新登录"});
                    } else {
                        req.identity = decoded.identity;
                        req.username = decoded.username;
                        next();
                    }
                } else {
                    res.status(403).json({
                        code: '403',
                        message: '已退出登录，需要重新登录'
                    })
                }
            });
        } else {
            res.status(401).json({
                code: '401',
                message: '请求没有token'
            })
        }
    } else {
        next();
    }
}

module.exports = checkToken;