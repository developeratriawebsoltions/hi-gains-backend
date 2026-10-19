import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@higains.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@higains.com",
      password: "hashed_password_here",
    },
  });
  console.log("Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
