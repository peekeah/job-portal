export const features = [
  {
    title: 'Smart Job Search',
    description:
      'Find jobs that match your skills, experience, and preferences using intelligent filters and ranking.',
  },
  {
    title: 'Verified Employers',
    description:
      'All employers and job postings go through a verification process for maximum trust.',
  },
  {
    title: 'Candidate Profiles',
    description:
      'Create a professional profile showcasing your skills, experience, and achievements.',
  },
  {
    title: 'Company Dashboard',
    description:
      'Companies can post jobs, manage applicants, review resumes, and schedule interviews.',
  },
  {
    title: 'Application Tracking',
    description:
      'Track your application status in real-time — viewed, shortlisted, or in review.',
  },
  {
    title: 'Resume Builder',
    description:
      'Generate a polished, professional resume using built-in templates.',
  },
];

export const pricing = {
  candidates: [
    {
      plan: 'Free',
      price: '0',
      features: [
        'Unlimited job search',
        'Unlimited job applications',
        'Create and edit full profile',
        'Personalized recommendations',
        'Job alerts',
        'Save jobs and track applications',
      ],
    },
    {
      plan: 'Premium',
      price: '199',
      currency: 'INR',
      billing: 'per month',
      features: [
        'Featured profile for higher visibility',
        'Resume review and score',
        'Premium job recommendations',
        'Priority customer support',
        'Access to top-tier opportunities',
      ],
    },
  ],
  companies: [
    {
      plan: 'starter',
      price: '999',
      currency: 'INR',
      billing: 'per month',
      features: [
        '3 job postings',
        'Unlimited candidate search',
        'Basic applicant tracking',
        'Company profile',
      ],
    },
    {
      plan: 'growth',
      price: '2999',
      currency: 'INR',
      billing: 'per month',
      features: [
        '10 job postings',
        'Highlighted job listings',
        'Smart resume filtering',
        'Shortlist management',
        'Interview scheduling',
      ],
    },
    {
      plan: 'pro',
      price: '7999',
      currency: 'INR',
      billing: 'per month',
      features: [
        'Unlimited job postings',
        'AI-powered candidate matching',
        'Access to full resume database',
        'Team collaboration tools',
        'Dedicated account manager',
        'Employer brand promotion',
      ],
    },
  ],
};

export const faq = [
  {
    question: 'Is the platform free for job seekers?',
    answer:
      'Yes. Candidates can search and apply to unlimited jobs for free. Premium features are optional.',
  },
  {
    question: 'How do companies post jobs?',
    answer:
      'They can create a company account, choose a plan, and post jobs directly from the dashboard.',
  },
  {
    question: 'Can candidates track their application status?',
    answer:
      'Yes. Candidates can see when their application is viewed, shortlisted, or moved to the next stage.',
  },
  {
    question: 'Can recruiters message candidates directly?',
    answer:
      'Yes. Recruiters can chat with shortlisted candidates using the built-in messaging system.',
  },
  {
    question: 'What payment methods are supported?',
    answer:
      'We support UPI, cards, online banking, and invoice billing for enterprise plans.',
  },
];
