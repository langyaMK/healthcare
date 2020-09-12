var mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

var scheduleSchema =  new mongoose.Schema({
    doctor:{
        type:ObjectId,
        required:true,
    },
    date:{
        type:Date,
        required:true,
    },
    office:{
        type:String,
        required:true,
    }
})
//静态方法，增加排班表
scheduleSchema.statics.insertSchedule = function(json,callback){
    var users = new Schedule(json);
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
var Schedule = mongoose.model('schedule',scheduleSchema);

module.exports = Schedule;
