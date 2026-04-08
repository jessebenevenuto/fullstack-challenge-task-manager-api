import { TaskPriority, TaskStatus } from "@prisma/client"
import { Request, Response } from "express"
import { z } from "zod"

import { AppError } from "@/utils/app-error"
import { prisma } from "@/database/prisma"

const { completed, in_progress, pending } = TaskStatus
const { high, low, medium } = TaskPriority

export class TasksController{
  async index(req: Request, res: Response){
    const queryParams = z.object({
      status: z.enum([completed, in_progress, pending]).optional(),
      priority: z.enum([high, low, medium]).optional()
    })

    const { status, priority } = queryParams.parse(req.query)

    const tasks = await prisma.task.findMany({
      where: {
        status: {
          equals: status
        },
        priority: {
          equals: priority
        }
      },
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            description: true
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
            changedAt: "asc"
          }
        }
      }
    })
    
    res.json({ tasks })
    return
  }
  
  async create(req: Request, res: Response){
    const bodySchema = z.object({
      title: z.string().trim().min(5, "O título da tarefa deve conter no mínimo 5 caracteres"),
      description: z.string().trim().optional(),
      status: z.enum([completed, in_progress, pending]).default(pending),
      priority: z.enum([high, low, medium]),
      assigned_to: z.string().uuid("Id inválido"),
      team_id: z.string().uuid("Id inválido")
    })

    const { title, description, status, priority, assigned_to, team_id } = bodySchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { id: assigned_to }
    })

    if(!user){
      throw new AppError("Usuário informado não foi encontrado", 404)
    }

    const team = await prisma.team.findUnique({
      where: { id: team_id }
    })

    if(!team){
      throw new AppError("Time informado não foi encontrado", 404)
    }

    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: assigned_to,
          teamId: team_id
        }
      }
    })

    if(!teamMember){
      throw new AppError("Usuário informado não está no time informado")
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        assignedTo: assigned_to,
        teamId: team_id
      }
    })

    res.status(201).json({ task })
    return
  }

  async update(req: Request, res: Response){
    const paramsSchema = z.object({
      id: z.string().uuid("Id inválido")
    })

    const { id } = paramsSchema.parse(req.params)

    const task = await prisma.task.findUnique({
      where: { id }
    })

    if(!task){
      throw new AppError("Task não encontrada", 404)
    }

    const bodySchema = z.object({
      title: z.string().trim().min(5, "O título da tarefa deve conter no mínimo 5 caracteres").optional(),
      description: z.string().trim(),
      priority: z.enum([high, low, medium]).optional(),
      assigned_to: z.string().uuid("Id inválido").default(task.assignedTo),
      team_id: z.string().uuid("Id inválido").default(task.teamId)
    })
    
    const { title, description, priority, assigned_to, team_id } = bodySchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { id: assigned_to }
    })

    if(!user){
      throw new AppError("Usuário informado não foi encontrado", 404)
    }

    const team = await prisma.team.findUnique({
      where: { id: team_id }
    })

    if(!team){
      throw new AppError("Time informado não foi encontrado", 404)
    }

    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: assigned_to,
          teamId: team_id
        }
      }
    })

    if(!teamMember){
      throw new AppError("Usuário informado não está no time informado")
    }

    const status = task.assignedTo !== assigned_to ? "pending" : task.status

    if(!req.user?.id){
      throw new AppError("Não autorizado", 401)
    }

    if(task.assignedTo !== assigned_to){
      await prisma.taskHistory.create({
        data: {
          oldStatus: task.status,
          newStatus: status,
          changedBy: req.user.id,
          taskId: id
        }
      })
    }

    const newTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        status,
        assignedTo: assigned_to,
        teamId: team_id
      }
    })
    
    res.json({ task: newTask })
    return
  }

  async remove(req: Request, res: Response){
    const paramsSchema = z.object({
      id: z.string().uuid("Id inválido")
    })

    const { id } = paramsSchema.parse(req.params)

    const task = await prisma.task.findUnique({
      where: { id }
    })

    if(!task){
      throw new AppError("Task não encontrada", 404)
    }

    const taskHistories = await prisma.taskHistory.findMany({
      where: {
        taskId: id
      }
    })

    if(taskHistories){
      await prisma.taskHistory.deleteMany({
        where: {
          taskId: id
        }
      })
    }

    await prisma.task.delete({
      where: { id }
    })

    res.json({ task })
    return
  }
}
