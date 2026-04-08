import request from "supertest"

import { app } from "@/app"

describe("TeamsController", () => {
  it("should not be allowed to create a new team without being logged in", async () => {
    const teamResp = await request(app).post("/teams").send({
      name: "test name",
      description: "test desc"
    })

    expect(teamResp.status).toBe(401)
  })
})
