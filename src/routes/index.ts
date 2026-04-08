import { Router } from "express"

import { usersRoutes } from "@/routes/users-routes"
import { sessionsRoutes } from "./sessions-routes"
import { teamsRoutes } from "./teams-routes"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"
import { teamMemberRoutes } from "./team-members-routes"
import { tasksRoutes } from "./tasks-routes"
import { teamTasksRoutes } from "./team-tasks-routes"
import { taskHistoryRoutes } from "./task-history-routes"

const routes = Router()

// Public Routes
routes.use("/users", usersRoutes)
routes.use("/sessions", sessionsRoutes)

// Private Routes
routes.use(ensureAuthenticated)
routes.use("/teams", teamsRoutes)
routes.use("/team-members", teamMemberRoutes)
routes.use("/tasks", tasksRoutes)
routes.use("/team-tasks", teamTasksRoutes)
routes.use("/task-history", taskHistoryRoutes)

export { routes }
