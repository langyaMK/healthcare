var mongoose = require("mongoose");

var doctorSchema =  new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        dropDups:true,
    },
    password:{
        type:String,
        required:true,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    name:{
        type:String,
        required:true,
    }, 
    age:{
        type:Number,
    },
    sex:{
        type:String,
        default:"男",
        
    },
    rank:{
        type:String,
        required:true,
    },
    office:{
        type:String,
        required:true,
    },
    detail:{
        type:String,
    },
    specialize:{
        type:String,
    }
})
//静态方法，增加用户
doctorSchema.statics.insertDoctor = function(json,callback){
    var users = new Docotor(json);
    users.save(function(err){
        console.log(err)
        if(err){
            callback(err);  //服务器错误
            return;
        }
        //发回null这个状态
        callback(null);
    });
}
//类
var Docotor = mongoose.model('doctor',doctorSchema);


module.exports = Docotor;

