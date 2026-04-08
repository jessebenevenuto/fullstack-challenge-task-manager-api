import { Router } from "express"

import { TaskHistoryController } from "@/controllers/task-history-controller"

const taskHistoryRoutes = Router()
const taskHistoryController = new TaskHistoryController()

taskHistoryRoutes.post("/", taskHistoryController.create)

export { taskHistoryRoutes }
