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

  // ─── Test Student User (Undergraduate) ───────────────────────────────────
  const studentEmail = 'student@test.com';
  const studentPassword = 'Test@1234';

  const existingStudent = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (existingStudent) {
    console.log('Student user already exists:', studentEmail);
  } else {
    const hashed = await bcrypt.hash(studentPassword, 10);
    const student = await prisma.user.create({
      data: {
        email: studentEmail,
        password: hashed,
        role: 'STUDENT',
        firstName: 'Test',
        lastName: 'Student',
        isVerified: true,
      },
    });

    await prisma.candidateProfile.create({
      data: {
        userId: student.id,
        headline: 'Computer Science Undergraduate',
        location: 'Colombo, Sri Lanka',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        bio: 'Passionate CS undergraduate looking for internship opportunities.',
        linkedinUrl: 'https://linkedin.com/in/teststudent',
        githubUrl: 'https://github.com/teststudent',
      },
    });

    console.log('Student user created:', student.email);
    console.log('Email:', studentEmail);
    console.log('Password:', studentPassword);
  }

  // ─── Test Professional User (Employee) ───────────────────────────────────
  const professionalEmail = 'professional@test.com';
  const professionalPassword = 'Test@1234';

  const existingProfessional = await prisma.user.findUnique({ where: { email: professionalEmail } });
  if (existingProfessional) {
    console.log('Professional user already exists:', professionalEmail);
  } else {
    const hashed = await bcrypt.hash(professionalPassword, 10);
    const professional = await prisma.user.create({
      data: {
        email: professionalEmail,
        password: hashed,
        role: 'PROFESSIONAL',
        firstName: 'Test',
        lastName: 'Professional',
        isVerified: true,
      },
    });

    await prisma.candidateProfile.create({
      data: {
        userId: professional.id,
        headline: 'Senior Software Engineer',
        location: 'Kandy, Sri Lanka',
        skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
        bio: 'Experienced software engineer with 5+ years in full stack development.',
        linkedinUrl: 'https://linkedin.com/in/testprofessional',
        githubUrl: 'https://github.com/testprofessional',
        portfolioUrl: 'https://testprofessional.dev',
      },
    });

    console.log('Professional user created:', professional.email);
    console.log('Email:', professionalEmail);
    console.log('Password:', professionalPassword);
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