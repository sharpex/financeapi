const express = require("express");

const router = express.Router();
const Sub = require("../models/Sub");
const { Op } = require("sequelize");

router.post("/add", (req, res) => {
  //create a sub
  Sub.create({
    softwareId: req.body.softwareId,
    code: req.body.code,
    credLinker: req.credLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: 0,
  })
    .then((sub) => {
      req.io
        .to(req.body.softwareId)
        .emit("message", { ...sub, messageType: "sub" });
      res.json({ sub, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Sub couldn't be created",
      })
    );
});

//get subs
router.post("/get", (req, res) => {
  Sub.findAll({
    where: {
      softwareId: parseInt(req.body.instLinker / 1000),
    },
  })
    .then((subs) => {
      res.json({ subs, status: 200 });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: 500,
        message: "Unknown error",
      });
    });
});

//fetch subs using software id
router.post("/fetch", (req, res) => {
  Sub.findAll({
    where: {
      softwareId: req.body.softwareId,
    },
  })
    .then((subs) => {
      res.json({ subs, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
