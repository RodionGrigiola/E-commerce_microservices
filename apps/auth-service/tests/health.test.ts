import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../src/app";

describe("GET health", () => {
  it("должен возвращать статус 200 и ok: true", async () => {
    const response = await request(app)
      .get("/health")
      .expect("Content-Type", /json/);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
