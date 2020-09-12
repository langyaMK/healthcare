var mongoose = require("mongoose");

var librarySchema =  new mongoose.Schema({
    type:{
        type:String,
        required:true,
        enum: ['挂号费', '药品费', '治疗费', '检查费'],
    },
    name:{
        type:String,
        required:true,
        unique:true,
        dropDups:true,
    },
    price:{
        type:Number,
        required:true,
    }
})

//静态方法，增加药品
librarySchema.statics.insertLibrary = function(json,callback){
    var users = new Library(json);
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
var Library = mongoose.model('library',librarySchema);

module.exports = Library;

