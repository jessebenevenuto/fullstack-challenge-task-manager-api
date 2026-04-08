import { Router } from "express"

import { TeamTasksController } from "@/controllers/team-tasks-controller"

const teamTasksRoutes = Router()
const teamTasksController = new TeamTasksController()

teamTasksRoutes.get("/", teamTasksController.index)

export { teamTasksRoutes }
