var mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

var prescriptionSchema =  new mongoose.Schema({
    openid:{
        type:String,
        required:true,
    },
    registerid:{
        type:ObjectId,
        required:true,
    },
    libraryid:{
        type:ObjectId,
        required:true,
    },
    ispaid:{
        type:Boolean,
        default:false,
    },
    number:{
        type:Number,
        default:1,
    }
})

//静态方法，增加用户
prescriptionSchema.statics.insertPrescription = function(json,callback){
    var users = new Prescription(json);
    users.save(function(err){
        if(err){
            callback(err);  //服务器错误
            return;
        }
        //发回null这个状态
        callback(null);
    });
}
//类
var Prescription = mongoose.model('prescription',prescriptionSchema);

module.exports = Prescription;
