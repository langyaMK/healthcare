// var express = require('express');
var multer  = require('multer');
// var fs = require('fs');
// var upimgs = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './../upload');
    },
    filename: function (req, file, cb) {
        // var filename = (file.originalname).split(".")
        var fileFormat = (file.originalname).split(".");
        cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
});
var upload = multer({storage: storage});
exports.input = upload.single('image');

var storageAnamneses = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/www/hospital/image/anamneses');
    },
    filename: function (req, file, cb) {
        var filename = req.query.registerid
        var fileFormat = (file.originalname).split(".");
        cb(null, filename + "." + "png");
    }
});
var uploadAnamneses = multer({storage: storageAnamneses});
// var uploadAnamneses = 
exports.anamnesesInput = uploadAnamneses.single('image');



// upimgs.post("/img",, (req, res) => {
//     console.log("/api/upload/img");
//     console.log(req.body,req.file);
//     res.send(req.file);
// });
// module.exports = upload;