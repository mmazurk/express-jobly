"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
  const newJob = {
    title: "Overpaid Research Scientist",
    salary: 360000,
    equity: 0.22,
    companyHandle: "c1"
  };
  test("works", async function () {
    let job = await Job.create(newJob);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle as "companyHandle"
             FROM jobs
             WHERE id = 1`
    );
    expect(result.rows).toEqual([
      {
        id: 1,
        title: "Overpaid Research Scientist",
        salary: 360000,
        equity: "0.22",
        companyHandle: "c1"
      },
    ]);
  });
});
