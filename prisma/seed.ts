import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const users = [
    { email: 'ceo@wecolax.com', password: 'password123', role: 'CEO' },
    { email: 'cto@wecolax.com', password: 'password123', role: 'CTO' },
    { email: 'coo@wecolax.com', password: 'password123', role: 'COO' },
  ]

  console.log('Seeding database with executive accounts...')

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!existingUser) {
      const passwordHash = await bcrypt.hash(user.password, 10)
      await prisma.user.create({
        data: {
          email: user.email,
          passwordHash,
          role: user.role,
        },
      })
      console.log(`✅ ${user.role} user (${user.email}) created successfully!`)
    } else {
      console.log(`ℹ️ ${user.role} user already exists.`)
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
