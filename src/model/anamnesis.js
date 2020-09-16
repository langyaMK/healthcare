var mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

var anamnesisSchma = new mongoose.Schema({
    openid:{
        type: String,
    },
    registerid:{
        type:ObjectId,
        required:true,
    },
    date:{
        type:String
    },
    office:{
        type:String,
        required:true,
    },
    advice:{
        type:String,
    },
    diagnosis:{
        type:String,
    },
    statement:{
        type:String,
    }
})
//类
var Anamnesis = mongoose.model('anamnesis',anamnesisSchma);

module.exports = Anamnesis;
