import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { env } from "../config/env.js";
import type { RegisterInput, LoginInput, ProfileInput } from "../schemas/user.schema.js";

export const register = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email already in use");

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, password: hashed },
    select: { id: true, name: true, email: true },
  });

  const token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: "7d" });
  return { user, token };
};

export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: "7d" });
  return { user: { id: user.id, name: user.name, email: user.email }, token };
};

export const upsertProfile = async (userId: string, data: ProfileInput) => {
  return prisma.userProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
};

export const getProfile = async (userId: string) => {
  return prisma.userProfile.findUnique({ where: { userId } });
};
