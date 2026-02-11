import request from "supertest";
import app from "../app.js";

describe("GET /health", () => {
  it("returns ok", async () => {
    process.env.NODE_ENV = "test";
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", db: "skipped" });
  });
});
