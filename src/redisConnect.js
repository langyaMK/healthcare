var redis = require('redis'),
    RDS_PORT = 6379,            //端口号
    RDS_HOST = '127.0.0.1',     //服务器IP
    RDS_PWD = 'health',
    RDS_OPTS = { auth_pass: RDS_PWD },    //设置项
    client = redis.createClient(RDS_PORT, RDS_HOST, RDS_OPTS);

client.on('ready', function (res) {
    console.log('redis-ready');
});

/**
 * 获取键值同步返回
 * @param key
 * @returns {Promise<any>}
 */
client.synGet = async(key) => {
    // const newGet = async(key) => {
    //     let val = await new Promise((resolve => {
    //         client.get(key, function (err, res) {
    //             return resolve(res);
    //         });
    //     }));
    //     return JSON.parse(val);
    // };
    // return await newGet(key);
    return new Promise((resolve, reject)=>{
        client.get(key, (err, res)=>{
            // console.log(err, res);
            if(err){
                reject(err);
            }else{
                resolve(res);
            }
        });
    });
};

module.exports = client;