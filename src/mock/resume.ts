import { Resume as ResumeOriginal } from '@/lib/resume-parser/types';

type FeaturedSkill = {
  skill: string;
};

export type Resume = Omit<ResumeOriginal, 'skills'> & {
  skills: {
    featuredSkills: FeaturedSkill[];
    descriptions: string[];
  };
};

export const initialResume: Resume = {
  profile: {
    name: '',
    email: '',
    phone: '',
    url: '',
    summary: '',
    location: '',
  },
  workExperiences: [
    {
      company: '',
      jobTitle: '',
      date: '',
      descriptions: [],
    },
  ],
  educations: [
    {
      school: '',
      degree: '',
      date: '',
      gpa: '',
      descriptions: [],
    },
  ],
  projects: [
    {
      project: '',
      date: '',
      descriptions: [],
    },
  ],
  skills: {
    featuredSkills: [
      {
        skill: '',
      },
    ],
    descriptions: [],
  },
  custom: {
    descriptions: [],
  },
};

export const resumeMock: Resume = {
  profile: {
    name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    phone: '+91-9123456789',
    url: 'https://github.com/aaravmehta',
    summary:
      'Full Stack Engineer with 4+ years of experience building scalable, high-performance web applications. Experienced in React, Next.js, Node.js, and TypeScript with a strong focus on clean architecture, system design, and delivering business impact in startup environments.',
    location: 'Pune, India',
  },
  workExperiences: [
    {
      company: 'ByteWave Technologies',
      jobTitle: 'Senior Software Engineer',
      date: 'Jan 2022 – Present',
      descriptions: [
        'Led development of end-to-end features using Next.js, Node.js, and PostgreSQL.',
        'Designed scalable REST APIs and optimized backend services for performance.',
        'Worked closely with founders to translate product ideas into production-ready features.',
        'Mentored junior developers and conducted code reviews to maintain code quality.',
      ],
    },
    {
      company: 'CloudNest Systems',
      jobTitle: 'Software Engineer',
      date: 'Aug 2019 – Dec 2021',
      descriptions: [
        'Built and maintained web applications using React and Express.',
        'Implemented authentication, authorization, and secure API integrations.',
        'Improved application reliability by adding logging, monitoring, and tests.',
      ],
    },
  ],
  educations: [
    {
      school: 'National Institute of Engineering',
      degree: 'Bachelor of Engineering in Computer Science',
      date: '2015 – 2019',
      gpa: '8.0 / 10',
      descriptions: [
        'Focused on software engineering, databases, and distributed systems.',
        'Completed multiple team-based projects using modern web technologies.',
      ],
    },
  ],
  projects: [
    {
      project: 'PulseBoard – Analytics Dashboard',
      date: '2024',
      descriptions: [
        'Developed a real-time analytics dashboard for tracking business KPIs.',
        'Implemented role-based access, dynamic charts, and API-driven data updates.',
        'Built using Next.js, TypeScript, and PostgreSQL.',
      ],
    },
    {
      project: 'TaskHive – Team Productivity Tool',
      date: '2023',
      descriptions: [
        'Created a task and workflow management platform for small teams.',
        'Implemented real-time updates, notifications, and activity logs.',
        'Focused on scalability and clean modular architecture.',
      ],
    },
  ],
  skills: {
    featuredSkills: [
      {
        skill: 'JavaScript / TypeScript',
      },
      {
        skill: 'React & Next.js',
      },
      {
        skill: 'Node.js & Express',
      },
      {
        skill: 'PostgreSQL & MongoDB',
      },
    ],
    descriptions: [
      'Frontend development with React, Next.js, and modern CSS frameworks',
      'Backend development with Node.js, Express, and RESTful APIs',
      'Database design, optimization, and migrations',
      'Experience with Docker, CI/CD pipelines, and cloud deployments',
    ],
  },
  custom: {
    descriptions: [
      'Strong interest in system design and scalable architectures.',
      'Enjoys building side projects and experimenting with new technologies.',
    ],
  },
};
