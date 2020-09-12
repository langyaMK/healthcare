var mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

var registerSchema =  new mongoose.Schema({
    openid:{
        type:String,
        required:true,
    },
    office:{
        type:String,
        required:true,
    },
    doctorid:{
        type:ObjectId,
        required:true,
    },
    doctor:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    type:{//是否是专家号
        type:Boolean,
        required:true,
    },
    num:{
        type:Number,
        required:true,
    }
})

//静态方法，增加挂号单
registerSchema.statics.insertRegister = function(json,callback){
    var registers = new Register(json);
    registers.save(function(err){
        if(err){
            callback(err);  //服务器错误
            return;
        }
        //发回null这个状态
        callback(null);
    });
}

//类
var Register = mongoose.model('register',registerSchema);

module.exports = Register;
