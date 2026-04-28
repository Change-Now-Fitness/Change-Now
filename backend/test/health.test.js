const request = require("supertest");
const app = require("../server");

test("GET /health returns ok", async () => {
  const res = await request(app).get("/health");
  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({ status: "ok", service: "backend" });
});

