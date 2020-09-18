var express = require('express');
var router = express.Router();

var checkToken = require('./utils/checkToken');
const doctors = require("./route/doctors.js");
const patients = require("./route/patients.js");
const offices = require("./route/offices.js");
const schedules = require("./route/schedules.js");
const libraries = require("./route/libraries.js");
const registers = require("./route/registers.js");
const prescriptions = require("./route/prescriptions.js");
const anamneses = require("./route/anamneses.js");
const orders = require("./route/orders.js");
const hospitals = require("./route/hospitals")
//import pay from './route/orders.js'
//pay()
//const upimgs = require("./route/upimgs.js");

router.use(checkToken);
router.use("/doctors", doctors);
router.use("/patients", patients);
router.use("/offices", offices);
router.use("/schedules", schedules);
router.use("/library", libraries);
router.use("/registers", registers);
router.use("/prescriptions", prescriptions);
router.use("/anamneses",anamneses)
router.use("/orders",orders);
router.use("/hospitals",hospitals)
//router.use("/upload",upimgs);

router.get("/401", function (req, res) {
    res.status(401).json({ msg: "Auth Failed" })
})
router.get("/403", function (req, res) {
    res.status(403).json({ msg: "token timeout" })
})
module.exports = router;
