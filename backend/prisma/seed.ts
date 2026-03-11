// prisma/seed.ts
// Run with: npx ts-node prisma/seed.ts
// Creates a hardcoded admin user if one doesn't already exist.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@talvio.com';
  const adminPassword = 'Admin@1234'; // Change this in production

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin user already exists:', adminEmail);
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashed,
      role: 'ADMIN',
      firstName: 'Talvio',
      lastName: 'Admin',
      isVerified: true,
    },
  });

  console.log('Admin user created:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
