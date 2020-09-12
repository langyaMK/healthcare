var express = require('express');
var libraries = express.Router();
const url = require('url');
var Library = require('../model/library.js');

var showmodel = { type: 1, name: 1, price: 1 };

//添加新药品
libraries.post("/", function (req, res) {
    console.log(req.body.name);
    //var reponse=JSON.parse(res);
    Library.insertLibrary(req.body, function (err) {
        // console.log(result);
        //res.send(result);
        if (err) {
            if (err.code == 11000) {
                res.status(400).send({ message: "药品名重复" });
            }
            else {
                console.log(err);
                res.status(400).json({ message: err.message });
            }
        } else {
            res.send("添加成功");
        }
    })
})

//根据检索条件找药品
libraries.get("/", function (req, res) {
    var id = url.parse(req.url, true).query;
    //console.log(url.parse(req.url, true).query.Did);
    /*if(id['Oname']){
        id['Oname']=new RegExp(req.query.Oname);
    }*/
    Library.find(id, showmodel,
        function (err, result) {
            //console.log(result);
            res.send(result);
        });
})

//根据_id找药品
libraries.get("/:id", function (req, res) {
    //var name = url.parse(req.url, true).pathname;
    //name = name.substr(1);

    console.log(req.params.id);
    Library.find({ _id: req.params.id }, showmodel,
        function (err, result) {
            //console.log(result);
            res.send(result);
        });
})

//根据_id删除药品信息
libraries.delete("/:id", function (req, res) {
    //console.log(req.params.id);
    Library.remove({ _id: req.params.id }, function (err, result) {
        res.send(result);
    })

})

//根据检索条件删除药品信息
libraries.delete("/", function (req, res) {
    console.log(req.body);
    ids = req.body;
    Library.deleteMany({ _id: { $in: ids } }, function (err, result) {
        res.send(result);
    })
})

//根据检索条件使用patch更改药品信息
libraries.patch("/", function (req, res) {
    console.log(req.body);
    Library.updateMany(req.body[0], req.body[1], function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})

//根据检索条件使用put更改药品信息
libraries.put("/", function (req, res) {
    console.log(req.body);
    Library.updateMany(req.body[0], req.body[1], function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})

//根据_id使用patch更改药品信息
libraries.patch("/:id", function (req, res) {
    console.log(req.body);
    Library.updateOne({ _id: req.params.id }, req.body, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})

//根据_id使用put更改药品信息
libraries.put("/:id", function (req, res) {
    console.log(req.body);
    Library.updateOne({ _id: req.params.id }, req.body, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })

})
module.exports = libraries;