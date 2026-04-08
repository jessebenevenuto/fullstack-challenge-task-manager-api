import { Request, Response } from "express"
import { compare } from "bcrypt"
import jwt from "jsonwebtoken"
import { z } from "zod"

import { prisma } from "@/database/prisma"
import { authConfig } from "@/configs/auth"
import { AppError } from "@/utils/app-error"

export class SessionsController{
  async create(req: Request, res: Response){
    const bodySchema = z.object({
      email: z.string().email("E-mail inválido"),
      password: z.string().min(7, "A senha deve conter no mínimo 7 caracteres")
    })

    const { email, password } = bodySchema.parse(req.body)

    const user = await prisma.user.findFirst({ where: { email } })

    if(!user){
      throw new AppError("E-mail ou senha inválida", 401)
    }

    const passwordMatched = await compare(password, user.password)

    if(!passwordMatched){
      throw new AppError("E-mail ou senha inválida", 401)
    }

    const { secret, expiresIn } = authConfig.jwt

    const token = jwt.sign({ role: user.role }, secret, { subject: user.id, expiresIn })
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({ user: userWithoutPassword, token })
    return
  }
}
