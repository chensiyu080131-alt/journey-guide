import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

/** 单例 Prisma（仅服务端使用） */
export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  return globalForPrisma.prisma
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim())
}
