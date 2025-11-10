import { hashPassword } from "./../src/utils/bcrypt";
import { PrismaClient, UserType, CompanySize, JobStatus } from "./../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ======================
  // AUTH USERS
  // ======================
  const adminPassword = await hashPassword("Admin@123");
  const applicantPassword = await hashPassword("Applicant@123");
  const companyPassword = await hashPassword("Company@123");

  await prisma.auth.create({
    data: {
      email: "admin@example.com",
      password: adminPassword,
      user_type: UserType.admin,
    },
  });

  // Applicant Auth Records
  await prisma.auth.create({
    data: {
      email: "applicant1@example.com",
      password: applicantPassword,
      user_type: UserType.applicant,
    },
  });

  await prisma.auth.create({
    data: {
      email: "applicant2@example.com",
      password: applicantPassword,
      user_type: UserType.applicant,
    },
  });

  await prisma.auth.create({
    data: {
      email: "applicant3@example.com",
      password: applicantPassword,
      user_type: UserType.applicant,
    },
  });

  // Company Auth
  await prisma.auth.create({
    data: {
      email: "company1@example.com",
      password: companyPassword,
      user_type: UserType.company,
    },
  });

  await prisma.auth.create({
    data: {
      email: "company2@example.com",
      password: companyPassword,
      user_type: UserType.company,
    },
  });

  // ======================
  // COMPANIES
  // ======================
  const company1 = await prisma.company.create({
    data: {
      name: "TechNova Solutions",
      email: "company1@example.com",
      founding_year: 2015,
      company_type: "IT Services",
      contact_no: "9876543210",
      website: "https://technova.com",
      address: "Mumbai, India",
      size: CompanySize.SIZE_50_100,
      bio: "We build scalable tech products.",
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: "FinEdge Systems",
      email: "company2@example.com",
      founding_year: 2018,
      company_type: "FinTech",
      contact_no: "9988776655",
      website: "https://finedge.com",
      address: "Bangalore, India",
      size: CompanySize.SIZE_10_50,
      bio: "Reinventing finance with modern tools.",
    },
  });

  // ======================
  // APPLICANTS
  // ======================
  const applicant1 = await prisma.applicant.create({
    data: {
      name: "Rohan Sharma",
      email: "applicant1@example.com",
      mobile: "9999911111",
      college_name: "IIT Delhi",
      college_branch: "CSE",
      college_joining_year: "2020",
    },
  });

  const applicant2 = await prisma.applicant.create({
    data: {
      name: "Priya Verma",
      email: "applicant2@example.com",
      mobile: "8888822222",
      college_name: "NIT Trichy",
      college_branch: "ECE",
      college_joining_year: "2019",
    },
  });

  const applicant3 = await prisma.applicant.create({
    data: {
      name: "Amit Kumar",
      email: "applicant3@example.com",
      mobile: "7777733333",
      college_name: "BITS Pilani",
      college_branch: "EEE",
      college_joining_year: "2021",
    },
  });

  // ======================
  // JOBS
  // ======================
  const job1 = await prisma.job.create({
    data: {
      company_id: company1.id,
      job_role: "Frontend Developer",
      description: "React, Tailwind, TypeScript",
      ctc: 12.5,
      stipend: 0,
      location: "Remote",
      skills_required: ["React", "Next.js", "TypeScript"],
    },
  });

  const job2 = await prisma.job.create({
    data: {
      company_id: company1.id,
      job_role: "Backend Developer",
      description: "Node.js, PostgreSQL, Microservices",
      ctc: 15.0,
      stipend: 0,
      location: "Bangalore",
      skills_required: ["Node.js", "Express", "PostgreSQL"],
    },
  });

  const job3 = await prisma.job.create({
    data: {
      company_id: company2.id,
      job_role: "Machine Learning Engineer",
      description: "ML models, Python, LLM basics",
      ctc: 20.0,
      stipend: 0,
      location: "Remote",
      skills_required: ["ML", "Python", "TensorFlow"],
    },
  });

  // ======================
  // APPLIED JOBS
  // ======================
  await prisma.appliedJob.createMany({
    data: [
      {
        applicant_id: applicant1.id,
        jobId: job1.id,
        status: JobStatus.applied,
      },
      {
        applicant_id: applicant1.id,
        jobId: job2.id,
        status: JobStatus.shortlisted,
      },
      {
        applicant_id: applicant2.id,
        jobId: job3.id,
        status: JobStatus.applied,
      },
      {
        applicant_id: applicant3.id,
        jobId: job1.id,
        status: JobStatus.hired,
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

