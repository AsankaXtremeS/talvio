// prisma/seed.ts
// Run with: npx ts-node prisma/seed.ts
// Creates a hardcoded admin user and a test employer user if they don't already exist.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {

  // ─── Admin User ───────────────────────────────────────────────────────────
  const adminEmail = 'admin@talvio.com';
  const adminPassword = 'Admin@1234';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingAdmin) {
    console.log('Admin user already exists:', adminEmail);
  } else {
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

  // ─── Test Employer User ───────────────────────────────────────────────────
  // Creates an approved employer so we can test job post endpoints immediately
  // without going through the full registration + admin approval flow.
  const employerEmail = 'employer@test.com';
  const employerPassword = 'Test@1234';

  const existingEmployer = await prisma.user.findUnique({ where: { email: employerEmail } });
  if (existingEmployer) {
    console.log('Employer user already exists:', employerEmail);
  } else {
    const hashed = await bcrypt.hash(employerPassword, 10);

    // Create the User and EmployerProfile in one transaction
    // Status is set to APPROVED so we can test job posts right away
    const employer = await prisma.user.create({
      data: {
        email: employerEmail,
        password: hashed,
        role: 'EMPLOYER',
        firstName: 'Test',
        lastName: 'Employer',
        isVerified: true,
        // Create the EmployerProfile at the same time
        employerProfile: {
          create: {
            companyName: 'Test Company',
            registrationFileUrl: 'https://example.com/test-reg.pdf',
            registrationFileName: 'test-reg.pdf',
            // APPROVED so job post endpoints work immediately
            verificationStatus: 'APPROVED',
          },
        },
      },
    });
    console.log('Employer user created:', employer.email);
    console.log('Email:', employerEmail);
    console.log('Password:', employerPassword);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });