const request = require("supertest");
const app = require("../server");
const { createTestPool, ensureUser, deleteUserByEmail } = require("./_db");

const TEST_EMAIL = "e2e.user@local.test";
const TEST_PASSWORD = "e2e-password";
const FIRST = "E2E";
const LAST = "User";

describe("auth cookie flow (web)", () => {
  const pool = createTestPool();

  beforeAll(async () => {
    await ensureUser(pool, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      firstName: FIRST,
      lastName: LAST,
    });
  });

  afterAll(async () => {
    await deleteUserByEmail(pool, TEST_EMAIL);
    await pool.end();
  });

  test("login sets token cookie; /user/getName works; logout clears", async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD, platform: "web" });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toMatchObject({ success: true });

    const setCookie = loginRes.headers["set-cookie"];
    expect(Array.isArray(setCookie)).toBe(true);
    const tokenCookie = setCookie.find((c) => c.startsWith("token="));
    expect(tokenCookie).toBeTruthy();

    const profileRes = await request(app)
      .post("/user/getName")
      .set("Cookie", tokenCookie);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.full_name).toBe(`${FIRST} ${LAST}`);

    const logoutRes = await request(app)
      .post("/user/logOut")
      .set("Cookie", tokenCookie);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body).toMatchObject({ success: true });
  });
});

