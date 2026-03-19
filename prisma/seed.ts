import { hashPassword } from '../src/lib/bcrypt';
import { PrismaClient, UserType, CompanySize } from '@prisma/client';

const prisma = new PrismaClient();

/* eslint-disable no-console */
async function main() {
  console.log('🌱 Seeding database...');

  // ======================
  // PASSWORDS
  // ======================
  const [adminPassword, applicantPassword, companyPassword] = await Promise.all(
    [
      hashPassword('Admin@123'),
      hashPassword('Applicant@123'),
      hashPassword('Company@123'),
    ],
  );

  // ======================
  // AUTH USERS
  // ======================
  await Promise.all([
    prisma.auth.create({
      data: {
        email: 'admin@example.com',
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
      }),
    ),
    ...Array.from({ length: 5 }, (_, i) =>
      prisma.auth.create({
        data: {
          email: `company${i + 1}@example.com`,
          password: companyPassword,
          user_type: UserType.company,
        },
      }),
    ),
  ]);

  console.log('✓ Auth users created');

  // ======================
  // COMPANIES
  // ======================
  await prisma.company.createMany({
    data: [
      {
        name: 'TechNova Solutions',
        email: 'company1@example.com',
        founding_year: 2015,
        company_type: 'IT Services',
        contact_no: '9876543210',
        website: 'https://technova.com',
        linkedIn: '',
        twitter: '',
        address: 'Mumbai, India',
        size: CompanySize.SIZE_50_100,
        bio: 'Scalable digital solutions for global clients.',
      },
      {
        name: 'FinEdge Systems',
        email: 'company2@example.com',
        founding_year: 2018,
        company_type: 'FinTech',
        contact_no: '9988776655',
        website: 'https://finedge.com',
        linkedIn: '',
        twitter: '',
        address: 'Bangalore, India',
        size: CompanySize.SIZE_10_50,
        bio: 'AI-driven fintech innovation.',
      },
      {
        name: 'HealthCrest Labs',
        email: 'company3@example.com',
        founding_year: 2016,
        company_type: 'HealthTech',
        contact_no: '9090909090',
        website: 'https://healthcrest.ai',
        linkedIn: '',
        twitter: '',
        address: 'Pune, India',
        size: CompanySize.SIZE_10_50,
      },
      {
        name: 'EduSpark Innovations',
        email: 'company4@example.com',
        founding_year: 2019,
        company_type: 'EdTech',
        contact_no: '9099887766',
        website: 'https://eduspark.io',
        linkedIn: '',
        twitter: '',
        address: 'Hyderabad, India',
        size: CompanySize.SIZE_50_100,
      },
      {
        name: 'GreenGrid Energy',
        email: 'company5@example.com',
        founding_year: 2014,
        company_type: 'CleanTech',
        contact_no: '9099554433',
        website: 'https://greengrid.com',
        linkedIn: '',
        twitter: '',
        address: 'Delhi, India',
        size: CompanySize.SIZE_100_PLUS,
      },
    ],
  });

  const companies = await prisma.company.findMany();
  console.log('✓ Companies created');

  // ======================
  // APPLICANTS
  // ======================
  await prisma.applicant.createMany({
    data: [
      {
        name: 'Rohan Sharma',
        email: 'applicant1@example.com',
        mobile: '9999911111',
        college_name: 'IIT Delhi',
        college_branch: 'CSE',
        college_joining_year: '2020',
      },
      {
        name: 'Priya Verma',
        email: 'applicant2@example.com',
        mobile: '8888822222',
        college_name: 'NIT Trichy',
        college_branch: 'ECE',
        college_joining_year: '2019',
      },
      {
        name: 'Amit Kumar',
        email: 'applicant3@example.com',
        mobile: '7777733333',
        college_name: 'BITS Pilani',
        college_branch: 'EEE',
        college_joining_year: '2021',
      },
      {
        name: 'Neha Singh',
        email: 'applicant4@example.com',
        mobile: '6666644444',
        college_name: 'IIIT Hyderabad',
        college_branch: 'AI/ML',
        college_joining_year: '2022',
      },
      {
        name: 'Arjun Patel',
        email: 'applicant5@example.com',
        mobile: '5555533333',
        college_name: 'IISc Bangalore',
        college_branch: 'Data Science',
        college_joining_year: '2019',
      },
    ],
  });

  console.log('✓ Applicants created');

  // ======================
  // JOBS (NO APPLIED JOBS)
  // ======================
  const jobData = [
    // Tech
    {
      company_id: companies[0].id,
      job_role: 'Frontend Developer',
      ctc: 12.5,
      description:
        'We are looking for a Frontend Developer to build modern, scalable, and high-performance web applications. You will collaborate with designers, product managers, and backend engineers to deliver intuitive and visually polished user interfaces. Responsibilities include developing responsive applications using React, TypeScript, and Next.js, translating UI/UX designs into reusable components, integrating frontend code with backend APIs, optimizing performance, ensuring accessibility and cross-browser compatibility, and participating in code reviews. Success in this role means delivering fast, reliable, and maintainable frontend features that enhance user experience.',
      stipend: 0,
      location: 'Remote',
      skills_required: ['React', 'TypeScript', 'Next.js'],
    },
    {
      company_id: companies[0].id,
      job_role: 'Backend Engineer',
      description:
        'We are seeking a Backend Engineer to design, build, and maintain scalable backend systems that power core business functionality. You will be responsible for developing RESTful APIs using Node.js, designing efficient database schemas with PostgreSQL, implementing caching using Redis, and ensuring data security and system reliability. You will collaborate closely with frontend and DevOps teams to deliver performant and secure backend services. Success in this role means building stable, scalable systems that support business growth.',
      ctc: 15,
      stipend: 0,
      location: 'Bangalore',
      skills_required: ['Node.js', 'PostgreSQL', 'Redis'],
    },
    {
      company_id: companies[1].id,
      job_role: 'DevOps Engineer',
      description:
        'We are looking for a DevOps Engineer to manage cloud infrastructure, automate deployment pipelines, and ensure high system reliability. Responsibilities include building and maintaining CI/CD pipelines, managing containerized applications using Docker and Kubernetes, provisioning and maintaining AWS infrastructure, monitoring system performance, and implementing security best practices. Success in this role means faster deployments, stable systems, and minimal downtime.',
      ctc: 18,
      stipend: 0,
      location: 'Bangalore',
      skills_required: ['Docker', 'Kubernetes', 'AWS'],
    },
    {
      company_id: companies[1].id,
      job_role: 'Machine Learning Engineer',
      description:
        'We are seeking a Machine Learning Engineer to build, deploy, and scale machine learning models for production use cases. You will work on developing and training models using Python and PyTorch, building end-to-end ML pipelines, deploying models into production, monitoring performance, and collaborating with engineering teams to integrate ML services. Success in this role means delivering reliable machine learning solutions that create measurable business impact.',
      ctc: 20,
      stipend: 0,
      location: 'Remote',
      skills_required: ['Python', 'PyTorch', 'MLOps'],
    },

    // Data / AI
    {
      company_id: companies[2].id,
      job_role: 'Data Analyst',
      ctc: 10,
      description:
        'We are looking for a Data Analyst to analyze, interpret, and visualize data to support data-driven decision making. In this role, you will work closely with business and technical teams to collect, clean, and analyze healthcare-related datasets. Responsibilities include writing complex SQL queries, performing data analysis using Python, creating dashboards and reports using Power BI, and identifying trends and insights that can improve operational and business outcomes. Success in this role means delivering accurate, actionable insights that help stakeholders make informed decisions.',
      stipend: 0,
      location: 'Pune',
      skills_required: ['SQL', 'Python', 'Power BI'],
    },
    {
      company_id: companies[4].id,
      job_role: 'Data Scientist',
      description:
        'We are seeking a Data Scientist to build predictive and analytical models that solve real-world business problems. You will work on time-series analysis, forecasting, and machine learning models using structured and unstructured data. Responsibilities include data exploration, feature engineering, model development, evaluation, and deployment in collaboration with engineering teams. You will communicate insights and model results to stakeholders in a clear and actionable manner. Success in this role means delivering accurate predictive models that drive business impact.',
      ctc: 22,
      stipend: 0,
      location: 'Remote',
      skills_required: ['Python', 'Machine Learning'],
    },

    // Product / Design
    {
      company_id: companies[3].id,
      job_role: 'Product Manager',
      description:
        'We are looking for a Product Manager to own the product roadmap and drive end-to-end product execution. You will work closely with engineering, design, and business stakeholders to define product vision, gather requirements, prioritize features, and ensure timely delivery. Responsibilities include translating business goals into clear product requirements, analyzing user and market data, managing backlogs, and continuously improving the product based on feedback and metrics. Success in this role means shipping impactful features that align with business objectives and improve user satisfaction.',
      ctc: 19,
      stipend: 0,
      location: 'Hyderabad',
      skills_required: ['Agile', 'Analytics', 'Strategy'],
    },
    {
      company_id: companies[3].id,
      job_role: 'UI/UX Designer',
      description:
        'We are seeking a UI/UX Designer to design intuitive, engaging, and user-centered digital experiences. You will collaborate with product managers and engineers to transform ideas into visually appealing and usable designs. Responsibilities include creating user flows, wireframes, prototypes, and high-fidelity designs, maintaining design systems, and ensuring consistency across products. Success in this role means delivering designs that are both visually appealing and easy to use, resulting in a seamless user experience.',
      ctc: 9.5,
      stipend: 0,
      location: 'Remote',
      skills_required: ['Figma', 'Design Systems'],
    },

    // Business / Ops
    {
      company_id: companies[4].id,
      job_role: 'HR Executive',
      description:
        'We are looking for an HR Executive to manage hiring and day-to-day HR operations. You will be responsible for sourcing and screening candidates, coordinating interviews, managing onboarding processes, and supporting employee engagement initiatives. This role also involves maintaining HR records, assisting with performance management, and ensuring compliance with company policies. Success in this role means building strong teams and maintaining smooth HR operations.',
      ctc: 6.5,
      stipend: 0,
      location: 'Delhi',
      skills_required: ['Hiring', 'Communication'],
    },
    {
      company_id: companies[4].id,
      job_role: 'Business Analyst',
      description:
        'We are seeking a Business Analyst to translate business requirements into clear and actionable solutions. You will work closely with stakeholders to gather requirements, analyze business processes, and identify opportunities for improvement. Responsibilities include documenting functional requirements, working with data using SQL, and supporting teams in delivering solutions that align with business objectives. Success in this role means delivering well-defined solutions that improve efficiency and decision making.',
      ctc: 11,
      stipend: 0,
      location: 'Remote',
      skills_required: ['Requirement Analysis', 'SQL'],
    },

    // Marketing / Sales
    {
      company_id: companies[2].id,
      job_role: 'Digital Marketing Specialist',
      description:
        'We are looking for a Digital Marketing Specialist to drive growth through data-driven marketing campaigns. You will be responsible for planning, executing, and optimizing digital campaigns across multiple channels. Responsibilities include SEO optimization, managing paid advertising campaigns, analyzing performance metrics, and improving conversion rates. Success in this role means increasing brand visibility, engagement, and measurable business growth.',
      ctc: 8.5,
      stipend: 0,
      location: 'Remote',
      skills_required: ['SEO', 'Google Ads', 'Analytics'],
    },
    {
      company_id: companies[1].id,
      job_role: 'Sales Executive',
      description:
        'We are seeking a Sales Executive to handle B2B sales and build strong relationships with clients. You will be responsible for identifying leads, pitching products or services, managing the sales pipeline, and closing deals. Responsibilities also include maintaining CRM records, collaborating with internal teams, and meeting revenue targets. Success in this role means consistently achieving sales goals and contributing to business growth.',
      ctc: 7,
      stipend: 0,
      location: 'Mumbai',
      skills_required: ['Sales', 'CRM'],
    },

    // Internships
    {
      company_id: companies[0].id,
      job_role: 'Software Engineering Intern',
      description:
        'We are looking for a Software Engineering Intern to assist the engineering team with development tasks. You will work on real-world projects, write and test code, fix bugs, and learn best practices in software development. This role provides hands-on experience with modern development tools and workflows. Success in this role means actively contributing to features while gaining strong foundational engineering skills.',
      ctc: 0,
      stipend: 25000,
      location: 'Remote',
      skills_required: ['JavaScript', 'Git'],
    },
    {
      company_id: companies[1].id,
      job_role: 'AI Research Intern',
      description:
        'We are seeking an AI Research Intern to work on research and experimentation involving large language models and deep learning techniques. You will assist in conducting experiments, analyzing results, and implementing research ideas into prototypes. This role offers exposure to cutting-edge AI research and practical applications. Success in this role means producing meaningful research outcomes and contributing to innovative AI solutions.',
      ctc: 0,
      stipend: 30000,
      location: 'Remote',
      skills_required: ['Python', 'Deep Learning'],
    },
  ];

  await prisma.job.createMany({ data: jobData });

  console.log('✓ Jobs created');
  console.log('✅ Database seeded successfully');
}

main()
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
