import { Router } from "express"

import { TeamMembersController } from "@/controllers/team-members-controller"
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization"

const teamMemberRoutes = Router()
const teamMembersController = new TeamMembersController()

teamMemberRoutes.use(verifyUserAuthorization(["admin"]))
teamMemberRoutes.post("/", teamMembersController.create)
teamMemberRoutes.delete("/:user_id/:team_id", teamMembersController.remove)

export { teamMemberRoutes }
