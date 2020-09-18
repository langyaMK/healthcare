const AlipaySDK = require("alipay-sdk").default;
const alipayConfig = require('./alipay_config.js');
const alipay = new AlipaySDK(alipayConfig.AlipayBaseConfig)
const AlipayFormData = require('alipay-sdk/lib/form').default;

// 编写一个创建支付订单的函数，异步等待执行的函数
async function createOrder(goods) {
    let method = 'alipay.trade.wap.pay'; // 统一收单下单并支付页面接口
    // 公共参数 可根据业务需要决定是否传入，当前不用
    // let params = {
    //     app_id: '2016101000654289', // 应用 id
    //     method: method, // 调用接口
    //     format: 'JSON', // 返回数据
    //     charset: 'utf-8', // 字符编码
    //     sign_type: 'RSA2', // 验签类型
    //     timestamp: getFormatDate(), // 请求时间戳
    //     version: '1.0', // 版本
    // }
    // 根据官方给的 API 文档提供的一个参数集合
    let bizContent = {
        out_trade_no: goods.order._id.toString(), // 根据时间戳来生成一个订单号,
        product_code: 'FAST_INSTANT_TRADE_PAY', // 商品码，当前只支持这个
        total_amount: goods.totalAmount, // 商品价格
        subject: '医院订单',
        body: goods.names,
        // subject: goods.goodsName, // 商品名称
        timeout_express: '5m', // 超时时间
        // passback_params: JSON.stringify(goods.pack_params), // 将会返回的一个参数，可用于自定义商品信息最后做通知使用
    }
    const formData = new AlipayFormData(); // 获取一个实例化对象

    // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
    formData.setMethod('get');
    // formData.addField('returnUrl', 'http://jiangck.com:9999/payresult'); // 客户端支付成功后会同步跳回的地址
    formData.addField('notifyUrl', 'https://leeg4ng.com/api/orders/notify'); // 支付宝在用户支付成功后会异步通知的回调地址，必须在公网 IP 上才能收到
    formData.addField('bizContent', bizContent); // 将必要的参数集合添加进 form 表单

    // 异步向支付宝发送生成订单请求, 第二个参数为公共参数，不需要的话传入空对象就行
    const result = await alipay.exec(method, {}, {
        formData: formData
    });
    // 返回订单的结果信息
    return result;
}


module.exports = {
    createOrder: createOrder
}