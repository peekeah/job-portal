import { hashPassword } from "../src/lib/bcrypt";
import { PrismaClient, UserType, CompanySize, JobStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ======================
  // PASSWORDS (Hashed once)
  // ======================
  const [adminPassword, applicantPassword, companyPassword] = await Promise.all([
    hashPassword("Admin@123"),
    hashPassword("Applicant@123"),
    hashPassword("Company@123"),
  ]);

  // ======================
  // AUTH USERS
  // ======================
  const authUsers = await Promise.all([
    // Admin
    prisma.auth.create({
      data: {
        email: "admin@example.com",
        password: adminPassword,
        user_type: UserType.admin,
      },
    }),
    // Applicants
    ...Array.from({ length: 5 }, (_, i) =>
      prisma.auth.create({
        data: {
          email: `applicant${i + 1}@example.com`,
          password: applicantPassword,
          user_type: UserType.applicant,
        },
      })
    ),
    // Companies
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

  console.log("✓ Created auth users");

  // ======================
  // COMPANIES
  // ======================
  const companies = await prisma.company.createMany({
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
        bio: "We build scalable digital products that empower startups and enterprises.",
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
        bio: "Reinventing financial systems using AI and blockchain.",
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
        bio: "AI-powered healthcare diagnostics for next-gen hospitals.",
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
        bio: "Transforming education through gamified and personalized learning.",
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
        bio: "Sustainable energy innovations for a greener tomorrow.",
      },
    ],
  });

  const companyList = await prisma.company.findMany();
  console.log("✓ Created companies");

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
        profile_pic: "https://randomuser.me/api/portraits/men/32.jpg",
        bio: "Aspiring full-stack developer passionate about scalable web systems.",
      },
      {
        name: "Priya Verma",
        email: "applicant2@example.com",
        mobile: "8888822222",
        college_name: "NIT Trichy",
        college_branch: "ECE",
        college_joining_year: "2019",
        profile_pic: "https://randomuser.me/api/portraits/women/44.jpg",
        bio: "Frontend enthusiast with a knack for clean UI and user experience.",
      },
      {
        name: "Amit Kumar",
        email: "applicant3@example.com",
        mobile: "7777733333",
        college_name: "BITS Pilani",
        college_branch: "EEE",
        college_joining_year: "2021",
        profile_pic: "https://randomuser.me/api/portraits/men/47.jpg",
        bio: "Backend developer focusing on APIs, databases, and scalability.",
      },
      {
        name: "Neha Singh",
        email: "applicant4@example.com",
        mobile: "6666644444",
        college_name: "IIIT Hyderabad",
        college_branch: "AI/ML",
        college_joining_year: "2022",
        profile_pic: "https://randomuser.me/api/portraits/women/68.jpg",
        bio: "AI/ML student exploring real-world LLM applications.",
      },
      {
        name: "Arjun Patel",
        email: "applicant5@example.com",
        mobile: "5555533333",
        college_name: "IISc Bangalore",
        college_branch: "Data Science",
        college_joining_year: "2019",
        profile_pic: "https://randomuser.me/api/portraits/men/70.jpg",
        bio: "Data science enthusiast specializing in predictive analytics.",
      },
    ],
  });

  const applicantList = await prisma.applicant.findMany();
  console.log("✓ Created applicants");

  // ======================
  // JOBS (15 entries with detailed descriptions)
  // ======================
  const jobData = [
    {
      company_id: companyList[0].id,
      job_role: "Frontend Developer",
      description: "Join our dynamic team to build cutting-edge user interfaces for enterprise clients. You'll work with React 18, TypeScript, and modern CSS frameworks to create responsive, accessible web applications. We're looking for someone who loves crafting pixel-perfect designs and understands the importance of performance optimization. You'll collaborate closely with designers and backend engineers to deliver seamless user experiences. Experience with state management (Redux/Zustand), testing libraries (Jest/RTL), and modern build tools is highly valued.",
      ctc: 12.5,
      stipend: 0,
      location: "Remote",
      skills_required: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    },
    {
      company_id: companyList[0].id,
      job_role: "Backend Developer",
      description: "We're seeking a talented backend engineer to design and implement RESTful APIs and microservices architecture. You'll be working with Node.js, Express, and PostgreSQL to handle high-traffic applications serving millions of users. Your responsibilities include database design, query optimization, implementing authentication systems, and ensuring code security. Knowledge of caching strategies (Redis), message queues (RabbitMQ), and cloud deployment is a plus. Join us to build robust, scalable systems that power modern web applications.",
      ctc: 15.0,
      stipend: 0,
      location: "Bangalore",
      skills_required: ["Node.js", "Express", "PostgreSQL", "Redis"],
    },
    {
      company_id: companyList[1].id,
      job_role: "Machine Learning Engineer",
      description: "Be part of our AI team revolutionizing the fintech industry. You'll develop and deploy machine learning models for fraud detection, credit risk assessment, and personalized financial recommendations. Work with large-scale datasets, build training pipelines, and optimize model performance for production environments. Experience with Python, TensorFlow/PyTorch, and understanding of LLMs is essential. You'll also collaborate with data engineers to build robust ML infrastructure and with product teams to translate business problems into ML solutions.",
      ctc: 20.0,
      stipend: 0,
      location: "Remote",
      skills_required: ["Python", "TensorFlow", "LLMs", "MLOps"],
    },
    {
      company_id: companyList[1].id,
      job_role: "DevOps Engineer",
      description: "Looking for a DevOps expert to streamline our development and deployment processes. You'll architect and maintain CI/CD pipelines, manage Kubernetes clusters, and ensure high availability of our cloud infrastructure on AWS. Your role includes implementing infrastructure as code (Terraform), monitoring and logging solutions, and automating repetitive tasks. Strong knowledge of containerization, orchestration, and security best practices is required. Help us achieve faster deployment cycles and maintain 99.9% uptime.",
      ctc: 18.0,
      stipend: 0,
      location: "Bangalore",
      skills_required: ["Docker", "Kubernetes", "AWS", "Terraform"],
    },
    {
      company_id: companyList[2].id,
      job_role: "Data Analyst",
      description: "Join our healthcare analytics team to transform raw medical data into actionable insights. You'll work with large healthcare datasets, create comprehensive dashboards, and provide data-driven recommendations to improve patient outcomes. Your analysis will directly impact clinical decisions and operational efficiency. Strong SQL skills, proficiency in Python for data manipulation, and experience with visualization tools like Power BI or Tableau are essential. Knowledge of healthcare domain and HIPAA compliance is a bonus.",
      ctc: 10.0,
      stipend: 0,
      location: "Pune",
      skills_required: ["SQL", "Python", "Power BI", "Excel"],
    },
    {
      company_id: companyList[2].id,
      job_role: "AI Research Intern",
      description: "An exciting opportunity for students passionate about AI in healthcare. You'll work alongside experienced researchers on projects involving medical image analysis, natural language processing for clinical notes, and predictive modeling for disease diagnosis. This internship offers hands-on experience with state-of-the-art deep learning frameworks and access to real-world medical datasets. You'll contribute to research papers, attend conferences, and learn from industry experts. Perfect for those considering graduate studies or a career in AI research.",
      ctc: 0,
      stipend: 25000,
      location: "Remote",
      skills_required: ["Python", "PyTorch", "Deep Learning", "Computer Vision"],
    },
    {
      company_id: companyList[3].id,
      job_role: "Full Stack Developer",
      description: "Be the bridge between frontend and backend in our EdTech platform serving thousands of students daily. You'll build interactive learning modules, implement real-time features using WebSockets, and optimize database queries for performance. Work with our modern tech stack including React, Node.js, and MongoDB to create engaging educational experiences. Your work will include building video streaming features, quiz systems, progress tracking, and collaborative tools. We value developers who can think holistically about feature development from UI to database.",
      ctc: 14.0,
      stipend: 0,
      location: "Hyderabad",
      skills_required: ["React", "Node.js", "MongoDB", "WebSockets"],
    },
    {
      company_id: companyList[3].id,
      job_role: "UI/UX Designer",
      description: "We're looking for a creative designer who can make learning delightful and intuitive. You'll design user interfaces for our educational platform, conduct user research, create prototypes, and iterate based on feedback. Your designs should be accessible, engaging, and backed by design thinking principles. Experience with Figma, understanding of design systems, and ability to create animations and micro-interactions is essential. Work closely with product managers and developers to bring educational visions to life.",
      ctc: 9.5,
      stipend: 0,
      location: "Remote",
      skills_required: ["Figma", "Prototyping", "Design Systems", "User Research"],
    },
    {
      company_id: companyList[4].id,
      job_role: "IoT Engineer",
      description: "Help us build smart energy management systems using IoT devices and sensors. You'll design embedded systems, write firmware in C/C++, and integrate hardware with cloud platforms. Your work involves developing protocols for device communication, implementing edge computing solutions, and ensuring system reliability in real-world conditions. Experience with microcontrollers (Arduino/ESP32), MQTT, and understanding of electrical systems is required. Join us in creating technology that makes renewable energy more efficient and accessible.",
      ctc: 16.0,
      stipend: 0,
      location: "Delhi",
      skills_required: ["IoT", "C++", "Embedded Systems", "MQTT"],
    },
    {
      company_id: companyList[4].id,
      job_role: "Data Scientist",
      description: "Leverage data science to optimize energy consumption and predict demand patterns. You'll build machine learning models for forecasting, anomaly detection, and resource optimization. Work with time-series data, implement predictive algorithms, and create automated reporting systems. Strong Python skills, experience with scikit-learn, pandas, and data visualization libraries are essential. Your insights will help reduce energy waste and support our mission of sustainable energy management. Collaborate with domain experts to solve complex energy challenges.",
      ctc: 22.0,
      stipend: 0,
      location: "Remote",
      skills_required: ["Python", "Pandas", "Machine Learning", "Time Series"],
    },
    {
      company_id: companyList[0].id,
      job_role: "Mobile App Developer",
      description: "Create beautiful, performant mobile applications for iOS and Android platforms. You'll use React Native or Flutter to build cross-platform apps with native-like experiences. Your responsibilities include implementing responsive layouts, integrating with backend APIs, handling offline functionality, and optimizing app performance. Experience with app store deployment, push notifications, and mobile-specific UI patterns is valued. Join us to build apps that millions of users rely on daily for their business operations.",
      ctc: 13.5,
      stipend: 0,
      location: "Mumbai",
      skills_required: ["React Native", "Flutter", "Mobile UI", "REST APIs"],
    },
    {
      company_id: companyList[1].id,
      job_role: "Blockchain Developer",
      description: "Work on next-generation decentralized finance applications using blockchain technology. You'll develop smart contracts in Solidity, integrate Web3 functionality, and build secure DeFi protocols. Your role includes auditing contracts for security vulnerabilities, implementing token standards, and creating user-friendly interfaces for blockchain interactions. Strong understanding of Ethereum, cryptography, and distributed systems is required. Be part of the team building the future of transparent and trustless financial systems.",
      ctc: 24.0,
      stipend: 0,
      location: "Remote",
      skills_required: ["Solidity", "Web3", "Ethereum", "Smart Contracts"],
    },
    {
      company_id: companyList[2].id,
      job_role: "Quality Assurance Engineer",
      description: "Ensure the reliability and quality of our healthcare software through comprehensive testing strategies. You'll design test cases, perform manual and automated testing, and work closely with developers to identify and fix bugs. Experience with testing frameworks (Selenium, Cypress), API testing (Postman), and understanding of CI/CD integration is essential. In healthcare, quality isn't just important—it's critical. Your attention to detail will help us deliver safe, reliable software that healthcare professionals trust.",
      ctc: 11.0,
      stipend: 0,
      location: "Pune",
      skills_required: ["Selenium", "Cypress", "API Testing", "Test Automation"],
    },
    {
      company_id: companyList[3].id,
      job_role: "Product Manager",
      description: "Lead product development initiatives for our EdTech platform. You'll define product roadmaps, gather user requirements, prioritize features, and work with cross-functional teams to deliver impactful solutions. Your role involves analyzing market trends, conducting competitive research, and making data-driven decisions to improve user engagement and learning outcomes. Strong communication skills, technical understanding, and passion for education are essential. Shape the future of online learning by building products that make education accessible to everyone.",
      ctc: 19.0,
      stipend: 0,
      location: "Hyderabad",
      skills_required: ["Product Strategy", "Agile", "Analytics", "Stakeholder Management"],
    },
    {
      company_id: companyList[4].id,
      job_role: "Cloud Solutions Architect",
      description: "Design and implement scalable cloud architectures for our energy management platforms. You'll work with AWS/Azure services, architect microservices, implement serverless solutions, and ensure cost optimization. Your expertise will guide infrastructure decisions, security implementations, and disaster recovery strategies. Experience with cloud certifications, infrastructure as code, and multi-cloud deployments is highly valued. Help us build resilient, scalable systems that can handle millions of IoT devices and process real-time energy data efficiently.",
      ctc: 25.0,
      stipend: 0,
      location: "Remote",
      skills_required: ["AWS", "Azure", "Microservices", "System Design"],
    },
  ];

  await prisma.job.createMany({ data: jobData });
  const createdJobs = await prisma.job.findMany();
  console.log("✓ Created 15 jobs");

  // ======================
  // APPLIED JOBS
  // ======================
  await prisma.appliedJob.createMany({
    data: [
      { applicant_id: applicantList[0].id, jobId: createdJobs[0].id, status: JobStatus.applied },
      { applicant_id: applicantList[0].id, jobId: createdJobs[1].id, status: JobStatus.shortlisted },
      { applicant_id: applicantList[0].id, jobId: createdJobs[10].id, status: JobStatus.applied },
      { applicant_id: applicantList[1].id, jobId: createdJobs[2].id, status: JobStatus.applied },
      { applicant_id: applicantList[1].id, jobId: createdJobs[7].id, status: JobStatus.shortlisted },
      { applicant_id: applicantList[2].id, jobId: createdJobs[6].id, status: JobStatus.hired },
      { applicant_id: applicantList[2].id, jobId: createdJobs[1].id, status: JobStatus.applied },
      { applicant_id: applicantList[3].id, jobId: createdJobs[4].id, status: JobStatus.applied },
      { applicant_id: applicantList[3].id, jobId: createdJobs[5].id, status: JobStatus.shortlisted },
      { applicant_id: applicantList[4].id, jobId: createdJobs[9].id, status: JobStatus.hired },
      { applicant_id: applicantList[4].id, jobId: createdJobs[14].id, status: JobStatus.applied },
    ],
  });

  console.log("✓ Created applied jobs");
  console.log("✅ Database seeded successfully with 15 jobs!");
  console.log(`
📊 Summary:
   - Auth Users: ${authUsers.length}
   - Companies: 5
   - Applicants: 5
   - Jobs: 15
   - Applied Jobs: 11
  `);
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
