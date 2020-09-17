var mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

var orderSchema = new mongoose.Schema({
    isPaid:{
        type:Boolean,
        default: false,
    },
    prescriptionIds:[{type:ObjectId}
    ],
    totalAmount:{
        type:Number,
    },
    openid:{
        type:String,
        required:true,
    }
});

// //静态方法，增加用户
// officeSchema.statics.insertOffice = function(json,callback){
//     var users = new Office(json);
//     users.save(function(err){
//         if(err){
//             callback(err);  //服务器错误
//             return;
//         }
//         //发回null这个状态
//         callback(null);
//     });
// }
var Order = mongoose.model('order',orderSchema);

module.exports = Order;