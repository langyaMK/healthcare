var mongoose = require("mongoose");

var officeSchema = new mongoose.Schema({
    name:{
        type : String,
        required:true,
        unique:true,
        dropDups:true,
    },
    class:{
        type:String,
        required:true,
    },
    floor:{
        type : Number,
    },
    detail:{
        type:String,
    }
});

//静态方法，增加用户
officeSchema.statics.insertOffice = function(json,callback){
    var users = new Office(json);
    users.save(function(err){
        if(err){
            callback(err);  //服务器错误
            return;
        }
        //发回null这个状态
        callback(null);
    });
}
var Office = mongoose.model('office',officeSchema);

module.exports = Office;