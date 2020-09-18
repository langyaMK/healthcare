var express = require('express');
var orders = express.Router();
var request = require('request');
var path = require('path');
const url = require('url'); 
var querystring = require("querystring");
var fs = require('fs');
var Order = require("../model/order.js");
var Prescription = require("../model/prescription.js");
var ObjectId = require('mongodb').ObjectId


const AlipaySdk = require('alipay-sdk').default;
const AlipayFormData = require('alipay-sdk/lib/form').default;
const alipayConfig = require('../utils/alipay_config')
// 获取创建订单的自定义模块
const createOrder = require('../utils/createOrder.js').createOrder;
// 获取验签自定义模块
const checkSign = require('../utils/checkSign.js');

// let privateKeyPath = path.resolve(__dirname, '../private-key.pem');
// let publicKeyPath = path.resolve(__dirname, '../public-key.pem');
// console.log(privateKeyPath)

// const alipaySdk = new AlipaySdk({
//     appId: '2021000116693744',
//     privateKey: fs.readFileSync(privateKeyPath, 'ascii'),
//     gateway: 'https://openapi.alipaydev.com/gateway.do',
//     // alipayPublicKey: fs.readFileSync(publicKeyPath, 'ascii'),
// });

const alipaySdk = new AlipaySdk(alipayConfig.AlipayBaseConfig);
// console.log(fs.readFileSync(privateKeyPath, 'ascii'))
const method = 'alipay.trade.wap.pay';

orders.post("/",async function (req, res) {
    console.log(req.body);
    
    var temp = {};
    if(req.identity == 1){
        temp.openid = req.username
    }
    temp.prescriptionIds = req.body.prescriptionid;
    // console.log(search.prescriptionId);
    temp.prescriptionIds.forEach(function(item,index){
        temp.prescriptionIds[index] = ObjectId(item);
      }
    ) 
    // console.log(search.prescriptionId);
    temp.totalAmount = 0;
    var order = {};
   
    var searchResult = await Prescription.aggregate([
        {
            $match:{ _id:{ $in:temp.prescriptionIds }}
        },
        { // 操作的Model为Prescription
            $lookup: {
            from: "libraries", // 数据库中关联的集合名
            localField: "libraryid", // prescriptions文档中关联的字段
            foreignField: "_id", // libraries文档中关联的字段
            as: "libraries" // 返回数据的字段名
            }
        },
        {
            $unwind:"$libraries",
        },
    ])

    console.log(searchResult);
    // console.log(searchResult.libraries)
    searchResult.forEach(function(item){
        temp.totalAmount += item.number*item.libraries.price
    })
    console.log(temp.totalAmount);
    console.log(temp)
    var order = await Order.create(temp)
    console.log("order")

    console.log(order.totalAmount)
    var result = {};
    
    try{
        // const formData = new AlipayFormData();
        // formData.setMethod('get');
        // formData.addField('notifyUrl', 'https://leeg4ng.com/api/orders/notify');
        // formData.addField('bizContent', {
        //     outTradeNo: order._id.toString(),
        //     productCode: 'FAST_INSTANT_TRADE_PAY',
        //     totalAmount: order.totalAmount,
        //     subject: '商品',
        //     body: '商品详情',
        // });

        // const url = await alipaySdk.exec(method, {}, { formData })
        const url = await createOrder(order);
        result.url = url;
        result.orderId = order._id;

        console.log(result);
        res.send(result)
    } catch(e){
        console.log(e);
    }

    // res.send(result)
    
})

orders.post("/notify",async function (req, res) {
    // console.log(req)
    console.log("body")
    console.log(req.body)
    // console.log("query")
    // console.log(req.query)
    let result = await checkSign(req.body);
    if(result){
        console.log(req.body.out_trade_no);

        if(req.body.trade_status == "TRADE_SUCCESS"){
            Order.updateOne({_id: req.body.out_trade_no },{isPaid:true},function (err, result) {
                console.log(result);
            })
            var order = await Order.findOne({_id: req.body.out_trade_no },
                function (err, result) {
                    //console.log(result);
                    // res.send(result);
            })
            console.log(order)
            var prescritionIds = order.prescriptionIds;

            console.log(prescritionIds)
            prescritionIds.forEach(function(item){
                Prescription.updateOne({_id:item},{ispaid:true},
                    function (err, result) {
                        console.log(result);
                        // res.send(result);
                })
            })
        }
    }

    res.send("success")
})

//根据检索条件找订单(姓名模糊筛选)
orders.get("/", function (req, res) {
    var id = url.parse(req.url, true).query;
    var temp = {};
    if(req.identity == 1){
        temp.openid = req.username
    } 
    //console.log(url.parse(req.url, true).query.Did);
    // if (id['name']) {
    //     id['name'] = new RegExp(req.query.name);
    // }
    Order.find(temp,
        function (err, result) {
            //console.log(result);
            res.send(result);
    });
})


// alipaySdk.exec('alipay.system.oauth.token', {
//     grantType: 'authorization_code',
//     code: 'code',
//     refreshToken: 'token'
//   })
//     .then(result => {
//       // console.log(result);
//     })
//     .catch(err) {
//       // ...
//     }




module.exports = orders;
