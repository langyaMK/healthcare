var mongoose = require("mongoose");

var hospitalSchema =  new mongoose.Schema({
    detail:{
        type:String,
    }
})

//类
var Hospital = mongoose.model('hospital',hospitalSchema);

module.exports = Hospital;

