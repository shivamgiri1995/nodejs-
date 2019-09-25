const express = require("express");
const router = express.Router();
const trimRequest = require('trim-request');
const validate = require('../controllers/auth.validate');
const controller = require('../controllers/auth')


const Sab = require("../fakeJSON/Sab.json");
const viewListJson = require("../fakeJSON/viewLIst.json");
const leavedetailJson = require("../fakeJSON/leaveDetails.json");
const getDetailsJson = require("../fakeJSON/getDetails.json");




router.post('/login',trimRequest.all,validate.login, controller.login)
router.post("/rolelist",controller.addHeader,controller.roleList);
router.post("/logout",controller.logout);
router.post("/viewSab",controller.addHeader,viewSab);
router.post("/viewList",controller.addHeader, viewList);
router.post("/leavedetailsforapproverimage",controller.addHeader, leavedetailsforapproverimage);
router.post("/getDetails",controller.addHeader, getDetails);
router.get("/getimage",controller.addHeader, getimage); 







  function viewSab(req, res, next) {
    console.log("viewSab");
  
 
    res.send(Sab);
  }

  function viewList(req, res, next) {
    console.log("viewList");
  
 
    res.send(viewListJson);
  }

  function leavedetailsforapproverimage(req, res, next) {
    console.log("leavedetailsforapproverimage");
 
 
    res.send(leavedetailJson);
  }
  function getDetails(req, res, next) {
    console.log("getDetails");

 
    res.send(getDetailsJson);
  }

  function getimage(req, res, next) {
    console.log("getimage");
 
    res.send({});
  }
module.exports = router;
