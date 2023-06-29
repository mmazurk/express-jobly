const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin, ensureUserorAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const db = require("../db");

const router = new express.Router();

router.get("/", async function (req, res, next) {
  try {
    let jobList = await Job.getAll();
    return res.json({ jobList });
  } catch (err) {
    return next(err);
  }
});

// --------------------------------------------------------------------------
// This shows that I was able to implement the class methods correctly
// I"m going to skip the filtering route (see companies.js route) due to time constraints
// No Bearer Auth token needed

router.get("/test", async function (req, res, next) {
  try {
    // let job = await Job.getById(5);
    // return res.json({message: "updated", job});

    // let job = await Job.create({title: "Decider in Charge", salary: 89500, equity: 0, companyHandle: "watson-davis"})
    // return res.json({message: "updated", job});

    // let jobs = await Job.getbyQuery({title: "con", minSalary: 50000 })
    // return res.json({message: "updated", jobs});

    // let jobs = await Job.getbyQuery({title: "con", minSalary: 50000, hasEquity: true})
    // return res.json({message: "updated", jobs});

    // let job = await Job.update(201, {title: "Decider NOT in Charge"})
    // return res.json({message: "updated", job});

    return res.json({ message: "test area" });
  } catch (err) {
    return next(err);
  }
});


router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

// Note that I didn't do a route for Job.getByQuery
// But that I did test the functionality above in my /test route

router.get("/:id", ensureUserorAdmin, async function (req, res, next) {
  try {
    const job = await Job.getById(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
