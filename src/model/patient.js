var mongoose = require('mongoose');

var patientSchema = mongoose.Schema({
    openid:{
        type : String,
        required:true,
    },
    name:{
        type : String,
        required:true,
    },
    phone:{
        type : String,
    },
    identityCode:{
        type : String,
        required:true,
        unique:true,
        dropDups:true,
    }
})

//静态方法，增加病人
patientSchema.statics.insertPatient = function(json,callback){
    var patients = new Patient(json);
    patients.save(function(err){
        if(err){
            callback(err);  //服务器错误
            return;
        }
        //发回null这个状态
        callback(null);
    });
}

var Patient = mongoose.model('patient',patientSchema);

module.exports = Patient;
