"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "Bad PM Living in the UK",
    salary: 60000,
    equity: 0.22,
    companyHandle: "c1",
  };

  // added this test to ensure that middleware
  // "ensureAdmin" is working

  test("not authorized for users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  // changed this to a u2Token I created in _testCommon.js
  // then I exported it to this file
  // the u2Token is an admin

  test("ok for admins", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobList: [
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100000,
          equity: 0.11,
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 200000,
          equity: 0.22,
          companyHandle: "c2",
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 300000,
          equity: 0.33,
          companyHandle: "c3",
        },
      ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:handle */

describe("GET /jobs/:id", function () {
  test("does not work for non-admin", async function () {
    const resp = await request(app)
      .get(`/jobs/1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  // Wow, this was hard for two reasons;
  // I had to reset the auto-incrementing id field in _testCommon.js
  // and I had to change equity to a string

  test("works for admin", async function () {
    const resp = await request(app)
      .get(`/jobs/1`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "j1",
        salary: 100000,
        equity: "0.11",
        companyHandle: "c1",
      },
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .get(`/jobs/99`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

// /************************************** PATCH /jobs/:id */

// // Changed this so it fails if the user doesn't have admin token

// describe("PATCH /jobs/:id", function () {
//   test("doesn't work for non-admin", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/c1`)
//       .send({
//         name: "C1-new",
//       })
//       .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

// // This will work if user has admin token

//   test("works for admin", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/c1`)
//       .send({
//         name: "C1-new",
//       })
//       .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.body).toEqual({
//       company: {
//         id: "c1",
//         name: "C1-new",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     });
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app).patch(`/jobs/c1`).send({
//       name: "C1-new",
//     });
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found on no such company", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/nope`)
//       .send({
//         name: "new nope",
//       })
//       .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.statusCode).toEqual(404);
//   });

//   test("bad request on id change attempt", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/c1`)
//       .send({
//         id: "c1-new",
//       })
//       .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.statusCode).toEqual(400);
//   });

//   test("bad request on invalid data", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/c1`)
//       .send({
//         logoUrl: "not-a-url",
//       })
//       .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.statusCode).toEqual(400);
//   });
// });

// /************************************** DELETE /jobs/:id */

// // modified this so user needs admin token

// describe("DELETE /jobs/:id", function () {
//   test("doesn't work for users", async function () {
//     const resp = await request(app)
//       .delete(`/jobs/c1`)
//       .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("works for admin", async function () {
//     const resp = await request(app)
//       .delete(`/jobs/c1`)
//       .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.body).toEqual({ deleted: "c1" });
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app).delete(`/jobs/c1`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found for no such company", async function () {
//     const resp = await request(app)
//       .delete(`/jobs/nope`)
//       .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });

// /************************************** GET /jobs with query paramters */

// describe("GET /jobs with query paramters", function () {
//   test("uses query parameters", async function () {
//     const resp = await request(app).get("/jobs?name=c&maxEmployees=2");
//     expect(resp.body).toEqual({results: [
//         {
//           id: "c1",
//           name: "C1",
//           description: "Desc1",
//           numEmployees: 1,
//           logoUrl: "http://c1.img",
//         },
//         {
//           id: "c2",
//           name: "C2",
//           description: "Desc2",
//           numEmployees: 2,
//           logoUrl: "http://c2.img",
//         },
//       ]}
//     );
//   });
// });
