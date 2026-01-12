import { hashPassword } from "../src/lib/bcrypt";
import {
  PrismaClient,
  UserType,
  CompanySize,
  ResumeType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ======================
  // PASSWORDS
  // ======================
  const [adminPassword, applicantPassword, companyPassword] =
    await Promise.all([
      hashPassword("Admin@123"),
      hashPassword("Applicant@123"),
      hashPassword("Company@123"),
    ]);

  // ======================
  // AUTH USERS
  // ======================
  await Promise.all([
    prisma.auth.create({
      data: {
        email: "admin@example.com",
        password: adminPassword,
        user_type: UserType.admin,
      },
    }),
    ...Array.from({ length: 5 }, (_, i) =>
      prisma.auth.create({
        data: {
          email: `applicant${i + 1}@example.com`,
          password: applicantPassword,
          user_type: UserType.applicant,
        },
      })
    ),
    ...Array.from({ length: 5 }, (_, i) =>
      prisma.auth.create({
        data: {
          email: `company${i + 1}@example.com`,
          password: companyPassword,
          user_type: UserType.company,
        },
      })
    ),
  ]);

  console.log("✓ Auth users created");

  // ======================
  // COMPANIES
  // ======================
  await prisma.company.createMany({
    data: [
      {
        name: "TechNova Solutions",
        email: "company1@example.com",
        founding_year: 2015,
        company_type: "IT Services",
        contact_no: "9876543210",
        website: "https://technova.com",
        address: "Mumbai, India",
        size: CompanySize.SIZE_50_100,
        bio: "Scalable digital solutions for global clients.",
      },
      {
        name: "FinEdge Systems",
        email: "company2@example.com",
        founding_year: 2018,
        company_type: "FinTech",
        contact_no: "9988776655",
        website: "https://finedge.com",
        address: "Bangalore, India",
        size: CompanySize.SIZE_10_50,
        bio: "AI-driven fintech innovation.",
      },
      {
        name: "HealthCrest Labs",
        email: "company3@example.com",
        founding_year: 2016,
        company_type: "HealthTech",
        contact_no: "9090909090",
        website: "https://healthcrest.ai",
        address: "Pune, India",
        size: CompanySize.SIZE_10_50,
      },
      {
        name: "EduSpark Innovations",
        email: "company4@example.com",
        founding_year: 2019,
        company_type: "EdTech",
        contact_no: "9099887766",
        website: "https://eduspark.io",
        address: "Hyderabad, India",
        size: CompanySize.SIZE_50_100,
      },
      {
        name: "GreenGrid Energy",
        email: "company5@example.com",
        founding_year: 2014,
        company_type: "CleanTech",
        contact_no: "9099554433",
        website: "https://greengrid.com",
        address: "Delhi, India",
        size: CompanySize.SIZE_100_PLUS,
      },
    ],
  });

  const companies = await prisma.company.findMany();
  console.log("✓ Companies created");

  // ======================
  // APPLICANTS
  // ======================
  await prisma.applicant.createMany({
    data: [
      {
        name: "Rohan Sharma",
        email: "applicant1@example.com",
        mobile: "9999911111",
        college_name: "IIT Delhi",
        college_branch: "CSE",
        college_joining_year: "2020",
      },
      {
        name: "Priya Verma",
        email: "applicant2@example.com",
        mobile: "8888822222",
        college_name: "NIT Trichy",
        college_branch: "ECE",
        college_joining_year: "2019",
      },
      {
        name: "Amit Kumar",
        email: "applicant3@example.com",
        mobile: "7777733333",
        college_name: "BITS Pilani",
        college_branch: "EEE",
        college_joining_year: "2021",
      },
      {
        name: "Neha Singh",
        email: "applicant4@example.com",
        mobile: "6666644444",
        college_name: "IIIT Hyderabad",
        college_branch: "AI/ML",
        college_joining_year: "2022",
      },
      {
        name: "Arjun Patel",
        email: "applicant5@example.com",
        mobile: "5555533333",
        college_name: "IISc Bangalore",
        college_branch: "Data Science",
        college_joining_year: "2019",
      },
    ],
  });

  const applicants = await prisma.applicant.findMany();
  console.log("✓ Applicants created");

  // ======================
  // JOBS (NO APPLIED JOBS)
  // ======================
  const jobData = [
    // Tech
    {
      company_id: companies[0].id,
      job_role: "Frontend Developer",
      description: "Build modern frontend applications.",
      ctc: 12.5,
      stipend: 0,
      location: "Remote",
      skills_required: ["React", "TypeScript", "Next.js"],
    },
    {
      company_id: companies[0].id,
      job_role: "Backend Engineer",
      description: "Design scalable backend systems.",
      ctc: 15,
      stipend: 0,
      location: "Bangalore",
      skills_required: ["Node.js", "PostgreSQL", "Redis"],
    },
    {
      company_id: companies[1].id,
      job_role: "DevOps Engineer",
      description: "Manage CI/CD and cloud infrastructure.",
      ctc: 18,
      stipend: 0,
      location: "Bangalore",
      skills_required: ["Docker", "Kubernetes", "AWS"],
    },
    {
      company_id: companies[1].id,
      job_role: "Machine Learning Engineer",
      description: "Build ML models for production.",
      ctc: 20,
      stipend: 0,
      location: "Remote",
      skills_required: ["Python", "PyTorch", "MLOps"],
    },

    // Data / AI
    {
      company_id: companies[2].id,
      job_role: "Data Analyst",
      description: "Analyze healthcare data.",
      ctc: 10,
      stipend: 0,
      location: "Pune",
      skills_required: ["SQL", "Python", "Power BI"],
    },
    {
      company_id: companies[4].id,
      job_role: "Data Scientist",
      description: "Time-series and predictive analytics.",
      ctc: 22,
      stipend: 0,
      location: "Remote",
      skills_required: ["Python", "Machine Learning"],
    },

    // Product / Design
    {
      company_id: companies[3].id,
      job_role: "Product Manager",
      description: "Own product roadmap.",
      ctc: 19,
      stipend: 0,
      location: "Hyderabad",
      skills_required: ["Agile", "Analytics", "Strategy"],
    },
    {
      company_id: companies[3].id,
      job_role: "UI/UX Designer",
      description: "Design intuitive user experiences.",
      ctc: 9.5,
      stipend: 0,
      location: "Remote",
      skills_required: ["Figma", "Design Systems"],
    },

    // Business / Ops
    {
      company_id: companies[4].id,
      job_role: "HR Executive",
      description: "Manage hiring and HR operations.",
      ctc: 6.5,
      stipend: 0,
      location: "Delhi",
      skills_required: ["Hiring", "Communication"],
    },
    {
      company_id: companies[4].id,
      job_role: "Business Analyst",
      description: "Translate business needs into solutions.",
      ctc: 11,
      stipend: 0,
      location: "Remote",
      skills_required: ["Requirement Analysis", "SQL"],
    },

    // Marketing / Sales
    {
      company_id: companies[2].id,
      job_role: "Digital Marketing Specialist",
      description: "Drive growth through campaigns.",
      ctc: 8.5,
      stipend: 0,
      location: "Remote",
      skills_required: ["SEO", "Google Ads", "Analytics"],
    },
    {
      company_id: companies[1].id,
      job_role: "Sales Executive",
      description: "Handle B2B sales.",
      ctc: 7,
      stipend: 0,
      location: "Mumbai",
      skills_required: ["Sales", "CRM"],
    },

    // Internships
    {
      company_id: companies[0].id,
      job_role: "Software Engineering Intern",
      description: "Assist in development tasks.",
      ctc: 0,
      stipend: 25000,
      location: "Remote",
      skills_required: ["JavaScript", "Git"],
    },
    {
      company_id: companies[1].id,
      job_role: "AI Research Intern",
      description: "Work on LLM-based research.",
      ctc: 0,
      stipend: 30000,
      location: "Remote",
      skills_required: ["Python", "Deep Learning"],
    },
  ];

  await prisma.job.createMany({ data: jobData });

  console.log("✓ Jobs created");
  console.log("✅ Database seeded successfully");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
