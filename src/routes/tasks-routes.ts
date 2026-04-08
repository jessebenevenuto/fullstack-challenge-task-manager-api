import { Router } from "express";

import { TasksController } from "@/controllers/tasks-controller"
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization"

const tasksRoutes = Router()
const tasksController = new TasksController()

tasksRoutes.use(verifyUserAuthorization(["admin"]))

tasksRoutes.get("/", tasksController.index)
tasksRoutes.post("/", tasksController.create)
tasksRoutes.put("/:id", tasksController.update)
tasksRoutes.delete("/:id", tasksController.remove)

export { tasksRoutes }
