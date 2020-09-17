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

let privateKeyPath = path.resolve(__dirname, '../private-key.pem');
// console.log(privateKeyPath)
const alipaySdk = new AlipaySdk({
    appId: '2021000116693744',
    privateKey: fs.readFileSync(privateKeyPath, 'ascii'),
    gateway: 'https://openapi.alipaydev.com/gateway.do'
});
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
    console.log(searchResult.libraries)
    searchResult.forEach(function(item){
        temp.totalAmount += item.number*item.libraries.price
    })
    console.log(temp.totalAmount);
    console.log(temp)
    var order = await Order.create(temp)
    console.log("order")

    console.log(order.totalAmount)
    
    try{
        const formData = new AlipayFormData();
        formData.setMethod('get');
        formData.addField('notifyUrl', 'http://www.com/notify');
        formData.addField('bizContent', {
            outTradeNo: JSON.stringify(order._id),
            productCode: 'FAST_INSTANT_TRADE_PAY',
            totalAmount: order.totalAmount,
            subject: '商品',
            body: '商品详情',
        });

        const result = await alipaySdk.exec(method, {}, { formData })
        console.log(result);
        res.send(result)
    }catch(e){
        console.log(e);
    }



    // res.send(result)
    
})

async function pay() {
    try{
        const formData = new AlipayFormData();
        formData.setMethod('get');
        formData.addField('notifyUrl', 'http://www.com/notify');
        formData.addField('bizContent', {
            outTradeNo: 'out_trade_no',
            productCode: 'FAST_INSTANT_TRADE_PAY',
            totalAmount: '0.01',
            subject: '商品',
            body: '商品详情',
        });

        const result = await alipaySdk.exec(method, {}, { formData })
        console.log(result);
    }catch(e){
        console.log(e);
    }

    
}
// pay()


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
