import { Request, Response } from "express"
import { hash } from "bcrypt"
import { z } from "zod"

import { prisma } from "@/database/prisma"
import { AppError } from "@/utils/app-error"
import { UserRole } from "@prisma/client"

const { admin, member } = UserRole

export class UsersController {
  async index(req: Request, res: Response){
    const querySchema = z.object({
      page: z.coerce.number().optional().default(1),
      perPage: z.coerce.number().optional().default(5)
    })

    const { page, perPage } = querySchema.parse(req.query)
    const skip = (page - 1) * perPage

    const users = await prisma.user.findMany({
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        teamMembers: {
          select: {
            team: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        },
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
    })

    const usersWithoutPasswords = users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        teamMembers: user.teamMembers,
        tasks: user.tasks
      }
    })

    const totalRecords = await prisma.user.count()
    const totalPages = Math.ceil(totalRecords / perPage)

    res.json({
      users: usersWithoutPasswords,
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
      name: z.string().trim().min(2, "O nome deve conter no mínimo 2 caracteres"),
      email: z.string().email("E-mail inválido"),
      password: z.string().min(7, "A senha deve conter no mínimo 7 caracteres"),
      role: z.enum([admin, member]).default(member)
    })

    const { name, email, password, role } = bodySchema.parse(req.body)
    const userWithSameEmail = await prisma.user.findFirst({
      where: { email }
    })

    if(userWithSameEmail){
      throw new AppError("Já existe um usuário com este email!")
    }

    const hashedPassword = await hash(password, 8)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    })

    const { password: _, ...userWithoutPassword } = user

    res.status(201).json(userWithoutPassword)
    return
  }
}
