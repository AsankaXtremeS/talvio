// prisma/seed.ts
// Run with: npx ts-node prisma/seed.ts
// Creates a hardcoded admin user and a test employer user if they don't already exist.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {

  // 1. Admin
  const adminEmail = 'admin@talvio.com';
  const adminPassword = 'Admin@1234';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashed,
        role: 'ADMIN',
        firstName: 'Talvio',
        lastName: 'Admin',
        isVerified: true,
      },
    });
    console.log('✅ Admin created');
  }

  // 2. Employer & Job Posts
  const employerEmail = 'employer@test.com';
  const employerPassword = 'Test@1234';
  const existingEmployer = await prisma.user.findUnique({ where: { email: employerEmail } });
  let employerId = existingEmployer?.id;

  if (!existingEmployer) {
    const hashed = await bcrypt.hash(employerPassword, 10);
    const employer = await prisma.user.create({
      data: {
        email: employerEmail,
        password: hashed,
        role: 'EMPLOYER',
        firstName: 'Talvio',
        lastName: 'Solutions',
        isVerified: true,
        employerProfile: {
          create: {
            companyName: 'Talvio Tech',
            registrationFileUrl: 'https://utfs.io/f/sample-pdf.pdf',
            registrationFileName: 'registration.pdf',
            verificationStatus: 'APPROVED',
            companyDescription: 'Leading tech solutions provider specializing in AI and software development.',
          },
        },
      },
      include: { employerProfile: true }
    });
    employerId = employer.id;
    console.log('✅ Employer created');
  }

  const employerProfile = await prisma.employerProfile.findUnique({ where: { userId: employerId! } });
  const employerProfileId = employerProfile!.id;

  // Create Job Posts
  const jobPosts = [
    {
      id: 'fb7b1f1a-6d1a-4d7a-8d1a-6d1a4d7a8d1a',
      title: 'Frontend Developer Intern',
      type: 'INTERNSHIP',
      description: 'Join our team as a Frontend Intern. You will work with React, Tailwind CSS, and TypeScript to build beautiful user interfaces.',
      location: 'Colombo',
      workMode: 'REMOTE',
      employmentType: 'FULL_TIME',
      skillsRequired: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'HTML', 'CSS'],
      status: 'ACTIVE',
    },
    {
      id: 'cb7b1f1a-6d1a-4d7a-8d1a-6d1a4d7a8d1b',
      title: 'Backend Developer Intern',
      type: 'INTERNSHIP',
      description: 'We are looking for a Node.js enthusiast to help us build scalable backend services and APIs.',
      location: 'Remote',
      workMode: 'REMOTE',
      employmentType: 'FULL_TIME',
      skillsRequired: ['Node.js', 'Express', 'PostgreSQL', 'Prisma', 'REST API', 'JavaScript'],
      status: 'ACTIVE',
    },
    {
      id: 'db7b1f1a-6d1a-4d7a-8d1a-6d1a4d7a8d1c',
      title: 'UI/UX Designer Intern',
      type: 'INTERNSHIP',
      description: 'Passionate about design? Join us to create intuitive user experiences and mockups for our web applications.',
      location: 'Kandy',
      workMode: 'HYBRID',
      employmentType: 'PART_TIME',
      skillsRequired: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'],
      status: 'ACTIVE',
    }
  ];

  for (const post of jobPosts) {
    await prisma.jobPost.upsert({
      where: { id: post.id },
      create: { 
        ...post, 
        employerId: employerProfileId,
      } as any,
      update: {},
    });
  }
  console.log('✅ Job Posts seeded');

  // 3. Student User
  const studentEmail = 'student@test.com';
  const hashedStudent = await bcrypt.hash('Test@1234', 10);
  const student = await prisma.user.upsert({
    where: { email: studentEmail },
    update: { role: 'STUDENT' }, // Ensure role is correct
    create: {
      email: studentEmail,
      password: hashedStudent,
      role: 'STUDENT',
      firstName: 'Test',
      lastName: 'Student',
      isVerified: true,
    }
  });

  const studentProfileData = {
    headline: 'Aspiring Web Developer',
    skills: ['React', 'JavaScript'],
    extractedSkills: [], // Start empty for testing upload
    cvUrl: null,
    cvFileName: null,
  };

  await prisma.candidateProfile.upsert({
    where: { userId: student.id },
    update: studentProfileData,
    create: {
      userId: student.id,
      ...studentProfileData
    } as any
  });
  console.log('✅ Student created/updated');

  // 4. Professional User
  const proEmail = 'professional@test.com';
  const hashedPro = await bcrypt.hash('Test@1234', 10);
  const professional = await prisma.user.upsert({
    where: { email: proEmail },
    update: { role: 'PROFESSIONAL' }, // Ensure role is correct
    create: {
      email: proEmail,
      password: hashedPro,
      role: 'PROFESSIONAL',
      firstName: 'Test',
      lastName: 'Professional',
      isVerified: true,
    }
  });

  const professionalProfileData = {
    headline: 'Senior Full Stack Developer',
    skills: ['Node.js', 'TypeScript', 'AWS'],
    extractedSkills: ['Node.js', 'TypeScript', 'AWS', 'Docker', 'React'],
    cvUrl: null,
    cvFileName: null,
  };

  await prisma.candidateProfile.upsert({
    where: { userId: professional.id },
    update: professionalProfileData,
    create: {
      userId: professional.id,
      ...professionalProfileData
    } as any
  });
  console.log('✅ Professional created/updated');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });