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
      title: 'Frontend Intern (React)',
      type: 'INTERNSHIP',
      description: 'We are looking for a React enthusiast to join our frontend team. You will work on building scalable UI components.',
      location: 'Colombo',
      workMode: 'REMOTE',
      employmentType: 'FULL_TIME',
      skillsRequired: ['React', 'JavaScript', 'CSS', 'Tailwind'],
      status: 'ACTIVE',
    },
    {
      id: 'cb7b1f1a-6d1a-4d7a-8d1a-6d1a4d7a8d1b',
      title: 'Backend Intern (Node.js)',
      type: 'INTERNSHIP',
      description: 'Join our backend team to build robust APIs using Node.js and PostgreSQL. Great learning opportunity.',
      location: 'Remote',
      workMode: 'REMOTE',
      employmentType: 'FULL_TIME',
      skillsRequired: ['Node.js', 'Express', 'PostgreSQL', 'Prisma'],
      status: 'ACTIVE',
    },
    {
      id: 'db7b1f1a-6d1a-4d7a-8d1a-6d1a4d7a8d1c',
      title: 'Full Stack Engineer',
      type: 'JOB',
      description: 'Experienced Full Stack Engineer needed to lead our main application development. Requires proficiency in React and Node.js.',
      location: 'Kandy',
      workMode: 'HYBRID',
      employmentType: 'FULL_TIME',
      skillsRequired: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
      status: 'ACTIVE',
    },
    {
      id: 'eb7b1f1a-6d1a-4d7a-8d1a-6d1a4d7a8d1d',
      title: 'DevOps Engineer',
      type: 'JOB',
      description: 'Manage our cloud infrastructure and CI/CD pipelines. Experience with AWS and Terraform is a must.',
      location: 'Colombo',
      workMode: 'ON_SITE',
      employmentType: 'FULL_TIME',
      skillsRequired: ['AWS', 'Terraform', 'Docker', 'Kubernetes'],
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
    extractedSkills: ['React', 'JavaScript', 'HTML', 'CSS'],
    cvUrl: 'https://utfs.io/f/sample-pdf.pdf',
    cvFileName: 'student_cv.pdf',
    cvText: 'I am a computer science student with a passion for frontend development. I have experience with React and JavaScript.',
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
    cvUrl: 'https://utfs.io/f/sample-pdf.pdf',
    cvFileName: 'pro_cv.pdf',
    cvText: 'Experienced developer with over 5 years in the industry. Expertise in Node.js, AWS and building scalable systems.',
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