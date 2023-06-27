"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  static async create({ title, salary, equity, companyHandle }) {
    if (isNaN(salary) || isNaN(equity)) {
      throw new BadRequestError("salary and equity must be numeric", 400);
    }

    const result = await db.query(
      `INSERT INTO jobs
         (title, salary, equity, company_handle)
         VALUES ($1, $2, $3, $4)
         RETURNING title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];
    return job;
  }

  static async getAll() {
    const result = await db.query(
      'select id, title, salary, equity, company_handle as "companyHandle" from jobs'
    );
    let jobs = result.rows;
    jobs = jobs.map(function (item) {
      return {
        id: item.id,
        title: item.title,
        salary: item.salary,
        equity: Number(item.equity),
        companyHandle: item.companyHandle,
      };
    });

    return jobs;
  }

  static async getById(id) {
    const result = await db.query(
      `select id, title, salary, equity, company_handle as "companyHandle" from jobs
           where id = $1`,
      [id]
    );

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  static async getbyQuery({ title, minSalary, hasEquity }) {
    let queryStr =
      'select id, title, salary, equity, company_handle as "companyHandle" from jobs where ';
    let queryArray = [];
    if (title) queryArray.push(`lower(title) like '%${title}%'`);
    if (minSalary) queryArray.push(`salary >= ${minSalary}`);
    if (hasEquity) queryArray.push(`equity > 0`);
    queryStr = queryStr + queryArray.join(" and ");
    const results = await db.query(queryStr);
    const jobs = results.rows;

    if (!jobs) throw new NotFoundError(`No jobs meet criteria.`);
    return jobs;
  }

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      companyHandle: "company_handle"
    });
    const handleVarIdx = "$" + (values.length + 1);
    const querySql = `UPDATE jobs SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];
    
    if (!job) throw new NotFoundError(`No company: ${id}`);
  }

}
module.exports = Job;
