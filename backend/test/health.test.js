const request = require("supertest");
const app = require("../server");

/**
 * Backend liveness regression test.
 *
 * How it fits:
 * - Runs without a DB connection.
 * - Confirms `backend/server.js` is wired and serving the `/health` endpoint.
 */
test("GET /health returns ok", async () => {
  const res = await request(app).get("/health");
  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({ status: "ok", service: "backend" });
});

