const express = require("express");
const router = express.Router();
const Sub = require("../models/Sub");
const Active = require("../models/Active");

const UpdateActive = (code, req) => {
  Active.findOne({
    where: {
      softwareId: req.body.softwareId,
      deleted: 0,
    },
  })
    .then((active) => {
      if (active) {
        active.activation = code;
        active.status = 1;
        active.trace = Date.now();
        active.save();
      }
    })
    .catch((err) => {});
};

const GenerateCode = (req, res) => {
  Sub.count({
    where: {
      softwareId: req.body.softwareId,
    },
  })
    .then((count) => {
      let code =
        (parseInt(req.body.softwareId) + parseInt(req.body.amount)) *
        (count + 2);
      Sub.create({
        softwareId: req.body.softwareId,
        code,
        live: 1,
        linker: Date.now(),
        trace: Date.now(),
        deleted: 0,
        status: 0,
      })
        .then((sub) => {
          UpdateActive(code, req);
          res.json({ sub, status: 201 });
        })
        .catch((err) => {
          res.json({
            status: 500,
            message: "Sub couldn't be created",
          });
        });
    })
    .catch((err) => {
      res.json({
        status: 500,
        message: "Sub couldn't be created",
      });
    });
};

//confirm transaction code and generate activation code
router.post("/verify", (req, res) => {
  if (req.body.pro !== process.env.PRO_PASS) {
    return res.json({
      status: 500,
      message: "Unknown error",
    });
  }
  GenerateCode(req, res);
});

//get subs
router.post("/subs", (req, res) => {
  if (req.body.pro !== process.env.PRO_PASS) {
    return res.json({
      status: 500,
      message: "Unknown error",
    });
  }

  Sub.findAll({})
    .then((subs) => {
      res.json({ subs, status: 200 });
    })
    .catch((err) => {
      res.json({
        status: 500,
        message: "Unknown error",
      });
    });
});

//get Actives
router.post("/actives", (req, res) => {
  if (req.body.pro !== process.env.PRO_PASS) {
    return res.json({
      status: 500,
      message: "Unknown error",
    });
  }
  Active.findAll({})
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

//edit active
router.post("/edit", (req, res) => {
  if (req.body.pro !== process.env.PRO_PASS) {
    res.json({
      status: 500,
      message: "Unknown error",
    });
  }
  Active.findOne({
    where: {
      softwareId: req.body.softwareId,
      deleted: 0,
    },
  })
    .then((active) => {
      if (active) {
        active.status = req.body.status;
        active.deleted = req.body.deleted;
        active.trace = Date.now();
        active.save();

        res.json({ active, status: 200 });
      } else {
        res.json({ status: 404, message: "Active not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Active couldn't be edited",
      })
    );
});

module.exports = router;
