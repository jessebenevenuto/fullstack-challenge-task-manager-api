import { Request, Response } from "express"
import { z } from "zod"

import { AppError } from "@/utils/app-error"
import { prisma } from "@/database/prisma"

export class TeamsController{
  async index(req: Request, res: Response){
    const querySchema = z.object({
      name: z.string().optional().default(""),
      page: z.coerce.number().optional().default(1),
      perPage: z.coerce.number().optional().default(5)
    })

    const { name, page, perPage } = querySchema.parse(req.query)
    const skip = (page - 1) * perPage

    const teams = await prisma.team.findMany({
      skip,
      take: perPage,
      where: {
        name: {
          contains: name.trim()
        }
      },
      orderBy: { createdAt: "desc" },
      include: {
        teamMembers: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                tasks: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                    priority: true
                  }
                }
              }
            }
          }
        }
      }
    })

    const totalRecords = await prisma.team.count({
      where: {
        name: {
          contains: name.trim()
        }
      }
    })

    const totalPages = Math.ceil(totalRecords / perPage)

    res.json({
      teams,
      pagination: {
        page,
        perPage,
        totalRecords,
        totalPages: totalPages > 0 ? totalPages : 1
      }
    })
    return
  }

  async create(req: Request, res: Response){
    const bodySchema = z.object({
      name: z.string().trim().min(5, "O nome do time deve ter no mínimo 5 caracteres"),
      description: z.string().trim().optional()
    })

    const { name, description } = bodySchema.parse(req.body)

    if(!req.user?.id){
      throw new AppError("Não autorizado", 401)
    }

    const teamName = await prisma.team.findFirst({ where: { name } })

    if(teamName){
      throw new AppError("Já existe um time com este nome")
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
      }
    })

    res.status(201).json(team)
    return
  }

  async update(req: Request, res: Response){
    const paramsSchema = z.object({
      id: z.string().uuid("Id inválido")
    })

    const bodySchema = z.object({
      name: z.string().trim().min(5, "O nome do time deve ter no mínimo 5 caracteres").optional(),
      description: z.string().trim()
    })

    const { id } = paramsSchema.parse(req.params)
    const { name, description } = bodySchema.parse(req.body)

    const team = await prisma.team.findUnique({ where: { id } })

    if(!team){
      throw new AppError("Time não encontrado", 404)
    }

    const newTeam = await prisma.team.update({
      data: {
        name,
        description
      },
      where: {
        id
      }
    })

    res.json(newTeam)
    return
  }

  async remove(req: Request, res: Response){
    const paramsSchema = z.object({
      id: z.string().uuid("Id inválido")
    })

    const { id } = paramsSchema.parse(req.params)

    const team = await prisma.team.findUnique({
      where: { id }
    })

    if(!team){
      throw new AppError("Time não encontrado", 404)
    }

    const teamWithUsers = await prisma.teamMember.findFirst({
      where: {
        teamId: id
      }
    })

    if(teamWithUsers){
      throw new AppError("Remova os usuários que fazem parte do time antes de deletá-lo")
    }

    const teamWithTasks = await prisma.task.findFirst({
      where: { teamId: id }
    })

    if(teamWithTasks){
      throw new AppError("Remova as tarefas que foram atribuídas ao time antes de deletá-lo")
    }
    
    await prisma.team.delete({
      where: { id }
    })
    
    res.json({ team })
    return
  }
}
