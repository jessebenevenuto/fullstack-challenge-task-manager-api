import { Request, Response } from "express"
import { z } from "zod"

import { AppError } from "@/utils/app-error"
import { prisma } from "@/database/prisma"

export class TeamMembersController{
  async create(req: Request, res: Response){
    const bodySchema = z.object({
      user_id: z.string().uuid("Id inválido"),
      team_id: z.string().uuid("Id inválido")
    })

    const { user_id, team_id } = bodySchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { id: user_id }
    })

    const team = await prisma.team.findUnique({
      where: { id: team_id }
    })

    if(!user){
      throw new AppError("Usuário não encontrado", 404)
    }

    if(!team){
      throw new AppError("Time não encontrado", 404)
    }

    const teamMemberExists = await prisma.teamMember.findFirst({
      where: {
        userId: user_id,
        teamId: team_id
      }
    })

    if(teamMemberExists){
      throw new AppError("Usuário informado já está no time informado")
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        userId: user_id,
        teamId: team_id
      }
    })

    res.status(201).json(teamMember)
    return
  }

  async remove(req: Request, res: Response){
    const paramsSchema = z.object({
      user_id: z.string().uuid("Id de usuário inválido"),
      team_id: z.string().uuid("Id de time inválido")
    })

    const { user_id, team_id } = paramsSchema.parse(req.params)

    const user = await prisma.user.findUnique({
      where: { id: user_id }
    })

    const team = await prisma.team.findUnique({
      where: { id: team_id }
    })

    if(!user){
      throw new AppError("Usuário não encontrado", 404)
    }

    if(!team){
      throw new AppError("Time não encontrado", 404)
    }

    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: user_id,
          teamId: team_id
        }
      }
    })

    if(!teamMember){
      throw new AppError("Usuário informado não está no time informado", 404)
    }

    await prisma.teamMember.delete({
      where: {
        userId_teamId: {
          userId: user_id,
          teamId: team_id
        }
      }
    })

    res.status(204).json()
    return
  }
}
