"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Company = require("../models/company");
const Job = require("../models/job")

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const db = require("../db");

const router = new express.Router();

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    // no query parameter data; just all companies
    if (!req.query.name && !req.query.minEmployees && !req.query.maxEmployees) {
      const companies = await Company.findAll();
      return res.json({ companies });
    } else { 
      // one or more query strings is present
      let companyName = req.query.name ? req.query.name.toLowerCase() : null;
      let minEmployees = req.query.minEmployees ? Number(req.query.minEmployees) : null;
      let maxEmployees = req.query.maxEmployees ? Number(req.query.maxEmployees) : null;

      // Check if minEmployees and maxEmployees are valid integers and maxEmployees is greater than minEmployees
      if (
        // minEmployees is there and it's not a valid integer OR
        // maxEmployees is there and it's not a valid integer OR
        // minEmployees and maxEmployees are there and (max - min) is negative
        (minEmployees && !Number.isInteger(minEmployees)) ||
        (maxEmployees && !Number.isInteger(maxEmployees)) ||
        (minEmployees && maxEmployees && !(maxEmployees - minEmployees > 0))
      ) {
        throw new BadRequestError(
          "numbers must be integers and max must be greater than min",
          400
        );
      }
     
      const results = await Company.getbyQuery({companyName, minEmployees, maxEmployees})
      return res.json({results});
  }
    } catch (err) {
      return next(err);
    }
});







/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.get(req.params.handle);
    const jobs = await Job.getByCompany(req.params.handle);
    return res.json({ company, jobs});
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
