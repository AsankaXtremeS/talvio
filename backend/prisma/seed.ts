import {
  PrismaClient,
  Role,
  VerificationStatus,
  JobType,
  PostStatus,
  WorkMode,
  EmploymentType,
  StipendType,
  ExperienceLevel,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const plainPassword = "Test@1234";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 1) Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@talvio.com" },
    update: {
      firstName: "Talvio",
      lastName: "Admin",
      role: Role.ADMIN,
      isVerified: true,
    },
    create: {
      email: "admin@talvio.com",
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
      firstName: "Talvio",
      lastName: "Admin",
    },
  });

  // 2) Employer user
  const employerUser = await prisma.user.upsert({
    where: { email: "employer.test2@talvio.com" },
    update: {
      firstName: "Eshan",
      lastName: "Employer",
      role: Role.EMPLOYER,
      isVerified: true,
    },
    create: {
      email: "employer.test2@talvio.com",
      password: hashedPassword,
      role: Role.EMPLOYER,
      isVerified: true,
      firstName: "Eshan",
      lastName: "Employer",
    },
  });

  // 3) Employer profile (approved so login and AI employer routes work)
  const employerProfile = await prisma.employerProfile.upsert({
    where: { userId: employerUser.id },
    update: {
      companyName: "Talvio Labs",
      registrationFileUrl: "uploads/seed-registration.pdf",
      registrationFileName: "seed-registration.pdf",
      verificationStatus: VerificationStatus.APPROVED,
      companyDescription: "Seeded company for local API testing.",
      companyWebsite: "https://talvio.test",
      companyLocation: "Colombo",
    },
    create: {
      userId: employerUser.id,
      companyName: "Talvio Labs",
      registrationFileUrl: "uploads/seed-registration.pdf",
      registrationFileName: "seed-registration.pdf",
      verificationStatus: VerificationStatus.APPROVED,
      companyDescription: "Seeded company for local API testing.",
      companyWebsite: "https://talvio.test",
      companyLocation: "Colombo",
    },
  });

  // 4) Candidate user
  const candidateUser = await prisma.user.upsert({
    where: { email: "candidate.test2@talvio.com" },
    update: {
      firstName: "Chama",
      lastName: "Candidate",
      role: Role.STUDENT,
      isVerified: true,
    },
    create: {
      email: "candidate.test2@talvio.com",
      password: hashedPassword,
      role: Role.STUDENT,
      isVerified: true,
      firstName: "Chama",
      lastName: "Candidate",
    },
  });

  // 5) Candidate profile
  const candidateProfile = await prisma.candidateProfile.upsert({
    where: { userId: candidateUser.id },
    update: {
      headline: "Junior Full Stack Developer",
      location: "Colombo",
      skills: ["TypeScript", "Node.js", "React", "Prisma", "PostgreSQL"],
      bio: "Seed candidate profile for AI endpoint testing.",
      cvPath: "uploads/seed-cv.pdf",
      cvFileName: "seed-cv.pdf",
      cvText:
        "I am a junior developer experienced with TypeScript, Node.js, React, Prisma, and PostgreSQL.",
    },
    create: {
      userId: candidateUser.id,
      headline: "Junior Full Stack Developer",
      location: "Colombo",
      skills: ["TypeScript", "Node.js", "React", "Prisma", "PostgreSQL"],
      bio: "Seed candidate profile for AI endpoint testing.",
      cvPath: "uploads/seed-cv.pdf",
      cvFileName: "seed-cv.pdf",
      cvText:
        "I am a junior developer experienced with TypeScript, Node.js, React, Prisma, and PostgreSQL.",
    },
  });

  // 6) Job post (create once, then update on next runs)
  const existingJob = await prisma.jobPost.findFirst({
    where: {
      employerId: employerProfile.id,
      title: "Backend Intern (Seed v2)",
    },
  });

  const jobPost = existingJob
    ? await prisma.jobPost.update({
        where: { id: existingJob.id },
        data: {
          type: JobType.INTERNSHIP,
          status: PostStatus.ACTIVE,
          description:
            "Design and build scalable backend APIs using Node.js, Prisma, and PostgreSQL with a strong focus on API quality and performance.",
          requirements: [
            "Basic Node.js knowledge",
            "Basic SQL knowledge",
            "Willingness to learn",
          ],
          responsibilities: [
            "Implement API endpoints",
            "Write clean TypeScript code",
            "Assist with DB migrations",
          ],
          skillsRequired: ["Node.js", "TypeScript", "Prisma", "PostgreSQL"],
          workMode: WorkMode.HYBRID,
          employmentType: EmploymentType.CONTRACT,
          stipendType: StipendType.PAID,
          location: "Colombo",
          duration: "6 months",
          experienceLevel: ExperienceLevel.ENTRY,
          closingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
      })
    : await prisma.jobPost.create({
        data: {
          employerId: employerProfile.id,
          title: "Backend Intern (Seed v2)",
          type: JobType.INTERNSHIP,
          status: PostStatus.ACTIVE,
          description:
            "Design and build scalable backend APIs using Node.js, Prisma, and PostgreSQL with a strong focus on API quality and performance.",
          requirements: [
            "Basic Node.js knowledge",
            "Basic SQL knowledge",
            "Willingness to learn",
          ],
          responsibilities: [
            "Implement API endpoints",
            "Write clean TypeScript code",
            "Assist with DB migrations",
          ],
          skillsRequired: ["Node.js", "TypeScript", "Prisma", "PostgreSQL"],
          workMode: WorkMode.HYBRID,
          employmentType: EmploymentType.CONTRACT,
          stipendType: StipendType.PAID,
          location: "Colombo",
          duration: "6 months",
          experienceLevel: ExperienceLevel.ENTRY,
          closingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
      });

  // 7) Seed one application so you also have APPLICATION_ID immediately
  const application = await prisma.application.upsert({
    where: {
      candidateProfileId_jobPostId: {
        candidateProfileId: candidateProfile.id,
        jobPostId: jobPost.id,
      },
    },
    update: {
      cvPath: "uploads/seed-cv.pdf",
      cvFileName: "seed-cv.pdf",
      cvText:
        "I am a junior developer experienced with TypeScript, Node.js, React, Prisma, and PostgreSQL.",
    },
    create: {
      candidateProfileId: candidateProfile.id,
      jobPostId: jobPost.id,
      cvPath: "uploads/seed-cv.pdf",
      cvFileName: "seed-cv.pdf",
      cvText:
        "I am a junior developer experienced with TypeScript, Node.js, React, Prisma, and PostgreSQL.",
    },
  });

  console.log("Seed completed");
  console.log("Admin:", admin.email);
  console.log("Candidate:", candidateUser.email, "password:", plainPassword);
  console.log("Employer:", employerUser.email, "password:", plainPassword);
  console.log("JOB_POST_ID:", jobPost.id);
  console.log("APPLICATION_ID:", application.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
