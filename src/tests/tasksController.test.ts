import request from "supertest"

import { app } from "@/app"

describe("TasksController", () => {
  it("should not be allowed to create a new task without being logged in", async () => {
    const taskResp = await request(app).post("/tasks").send({
      name: "task name",
      description: "task desc",
      priority: "task priority",
      assigned_to: "test user",
      team_id: "test team"
    })

    expect(taskResp.status).toBe(401)
  })
})
