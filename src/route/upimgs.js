var express = require('express');
var multer  = require('multer');
var fs = require('fs');
var upimgs = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({storage: storage});

upimgs.post("/img", upload.single("image"), (req, res) => {
    console.log("/api/upload/img");
    console.log(req.body,req.file);
    res.send({error: null});
});

module.exports = upimgs;