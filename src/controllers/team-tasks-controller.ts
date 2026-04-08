import { TaskPriority, TaskStatus } from "@prisma/client"
import { Request, Response } from "express"
import { z } from "zod"

import { prisma } from "@/database/prisma"
import { AppError } from "@/utils/app-error"

const { completed, in_progress, pending } = TaskStatus
const { high, low, medium } = TaskPriority

export class TeamTasksController{
  async index(req: Request, res: Response){
    const queryParams = z.object({
      status: z.enum([completed, in_progress, pending]).optional(),
      priority: z.enum([high, low, medium]).optional()
    })

    const { status, priority } = queryParams.parse(req.query)

    const user_id = req.user?.id

    if(!user_id){
      throw new AppError("Não autorizado", 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: user_id }
    })

    if(!user){
      throw new AppError("Usuário não encontrado", 404)
    }

    const teamTasks = await prisma.user.findUnique({
      where: {
        id: user_id
      },
      omit: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      include: {
        teamMembers: {
          select: {
            team: {
              select: {
                id: true,
                name: true,
                description: true,
                tasks: {
                  where: {
                    status: {
                      equals: status
                    },
                    priority: {
                      equals: priority
                    }
                  },
                  select: {
                    id: true,
                    title:true,
                    description: true,
                    status: true,
                    priority: true,
                    user: {
                      select: {
                        name: true,
                        email: true
                      }
                    },
                    taskHistories: {
                      select: {
                        id: true,
                        oldStatus: true,
                        newStatus: true,
                        changedAt: true,
                        user: {
                          select: {
                            name: true,
                            email: true,
                            role: true
                          }
                        }
                      },
                      orderBy: {
                        changedAt: "desc"
                      }
                    },
                  },
                  orderBy: {
                    updatedAt: "desc"
                  }
                }
              }
            }
          }
        }
      }
    })

    res.json(teamTasks)
    return
  }
}
