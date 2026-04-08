import { Request, Response } from "express"
import { z } from "zod"

import { TaskStatus } from "@prisma/client"
import { AppError } from "@/utils/app-error"
import { prisma } from "@/database/prisma"

const { completed, in_progress, pending } = TaskStatus

export class TaskHistoryController {
  async create(req: Request, res: Response){
    if(!req.user){
      throw new AppError("Não autorizado", 401)
    }

    const user_id = req.user?.id

    if(!user_id){
      throw new AppError("Não autorizado", 401)
    }

    const bodySchemaIds = z.object({
      task_id: z.string().uuid("Id da task inválido"),
      changed_by: z.string().uuid("Id inválido").default(user_id)
    })

    const { task_id, changed_by } = bodySchemaIds.parse(req.body)

    const user = await prisma.user.findUnique({
      where: {
        id: changed_by
      }
    })

    if(!user){
      throw new AppError("Usuário não encontrado", 404)
    }

    const task = await prisma.task.findUnique({
      where: { id: task_id },
    })

    if(!task){
      throw new AppError("Task não encontrada", 404)
    }

    const oldStatus = task.status

    const bodySchema = z.object({
      old_status: z.enum([completed, in_progress, pending]).default(oldStatus),
      new_status: z.enum([completed, in_progress, pending])
    })

    const { new_status, old_status } = bodySchema.parse(req.body)

    if(task.assignedTo !== user.id){
      throw new AppError("Não autorizado! A task informada não foi atribuída a você", 401)
    }

    if(task.status === "completed"){
      throw new AppError("Está tarefa já foi completada, não é possível criar mais históricos para ela")
    }

    const taskHistory = await prisma.taskHistory.create({
      data: {
        taskId: task_id,
        changedBy: changed_by,
        oldStatus: old_status,
        newStatus: new_status
      }
    })

    await prisma.task.update({
      where: {
        id: task_id
      },
      data: {
        status: taskHistory.newStatus
      }
    })

    res.status(201).json(taskHistory)
    return
  }
}
