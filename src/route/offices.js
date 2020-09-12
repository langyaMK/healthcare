var express = require('express');
var offices = express.Router();
const url = require('url');

var Office = require("../model/office.js");

var showmodel = { _id: 1, name: 1, class: 1, floor: 1, detail: 1 };
//根据检索条件找科室
offices.get("/", function (req, res) {
    var id = url.parse(req.url, true).query;
    //console.log(url.parse(req.url, true).query.Did);
    /*if(id['Oname']){
        id['Oname']=new RegExp(req.query.Oname);
    }*/
    Office.find(id, showmodel,
        function (err, result) {
            //console.log(result);
            res.send(result);
        });
})

//根据_id找科室
offices.get("/:id", function (req, res) {
    //var name = url.parse(req.url, true).pathname;
    //name = name.substr(1);

    console.log(req.params.id);
    Office.find({ _id: req.params.id }, showmodel,
        function (err, result) {
            //console.log(result);
            res.send(result);
        });
})

//添加新科室
offices.post("/", function (req, res) {
    console.log(req.body.name);
    //var reponse=JSON.parse(res);
    if (req.body.name) {
        Office.insertOffice(req.body, function (err) {
            // console.log(result);
            //res.send(result);
            if (err) {
                if (err.code == 11000) {
                    res.status(400).send({ message: "name重复" });
                }
                else {
                    console.log(err);
                    res.status(400).json({ message: err.message });
                }
            } else {
                res.send("添加成功");
            }
        })
    } else {
        res.status(400).send({ message: "没有name" });
    }
})

//删除科室信息
offices.delete("/:id", function (req, res) {
    //console.log(req.params.id);
    Office.remove({ _id: req.params.id }, function (err, result) {
        res.send(result);
    })

})

//删除科室信息
offices.delete("/", function (req, res) {
    console.log(req.body);
    ids = req.body;
    Office.deleteMany({ _id: { $in: ids } }, function (err, result) {
        res.send(result);
    })
})

//更改科室信息
offices.patch("/", function (req, res) {
    console.log(req.body);
    Office.updateMany(req.body[0], req.body[1], function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})
//更改科室信息
offices.put("/", function (req, res) {
    console.log(req.body);
    Office.updateMany(req.body[0], req.body[1], function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})

//更改科室信息
offices.patch("/:id", function (req, res) {
    console.log(req.body);
    Office.updateOne({ _id: req.params.id }, req.body, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})

//更改科室信息
offices.put("/:id", function (req, res) {
    console.log(req.body);
    Office.updateOne({ _id: req.params.id }, req.body, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
        
})
module.exports = offices;