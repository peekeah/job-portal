import {
  IconSearch,
  IconSparkles,
  IconFileText,
  IconChecklist,
  IconBuildingStore,
  IconStars,
  IconHelpCircle,
  IconEdit,
  IconCreditCard,
  IconRocket,
} from '@tabler/icons-react';

export const features = [
  {
    title: 'Smart Job Discovery',
    description:
      'Search relevant jobs using filters for role, location, and experience with faster decision making.',
    icon: IconSearch,
    upcoming: false,
  },
  {
    title: 'AI Resume Enhancement',
    description:
      'Improve resume wording and structure before applying using practical AI suggestions.',
    icon: IconSparkles,
    upcoming: false,
  },
  {
    title: 'Resume Management',
    description:
      'Maintain resume versions in one place for different roles and application needs.',
    icon: IconFileText,
    upcoming: false,
  },
  {
    title: 'Application Tracking',
    description:
      'Track saved jobs and submitted applications through one focused dashboard.',
    icon: IconChecklist,
    upcoming: false,
  },
  {
    title: 'Verified Employer Listings',
    description:
      'Explore structured listings with company details for better application confidence.',
    icon: IconBuildingStore,
    upcoming: false,
  },
  {
    title: 'AI Match Recommendations',
    description:
      'Receive smarter job suggestions based on profile relevance and activity.',
    icon: IconStars,
    upcoming: true,
  },
];

export const pricing = [
  {
    plan: 'Free',
    price: '0',
    description: 'Everything needed to start applying confidently.',
    features: [
      {
        label: 'Unlimited job search',
        upcoming: false,
      },
      {
        label: 'Unlimited job applications',
        upcoming: false,
      },
      {
        label: 'Create and manage candidate profile',
        upcoming: false,
      },
      {
        label: 'Resume upload and editing',
        upcoming: false,
      },
      {
        label: 'Track applications',
        upcoming: false,
      },
      {
        label: 'Save jobs for later',
        upcoming: true,
      },
    ],
  },
  {
    plan: 'Premium',
    price: '15',
    description: 'Advanced support for stronger applications.',
    badge: 'Most Popular',
    features: [
      {
        label: 'AI resume enhancement',
        upcoming: false,
      },
      {
        label: 'Resume quality suggestions',
        upcoming: false,
      },
      {
        label: 'Priority profile improvements',
        upcoming: false,
      },
      {
        label: 'Priority support',
        upcoming: false,
      },
      {
        label: 'Advanced recommendations',
        upcoming: true,
      },
      {
        label: 'Active resume selection',
        upcoming: true,
      },
    ],
  },
];

export const faq = [
  {
    question: 'Is Nexthire free for job seekers?',
    answer:
      'Yes. Core job search, profile creation, resume upload, and applications are available without cost. Premium features are optional.',
    icon: IconHelpCircle,
  },
  {
    question: 'How does AI resume enhancement help?',
    answer:
      'It improves wording, structure, and clarity so your resume becomes easier to review and better aligned with professional expectations.',
    icon: IconSparkles,
  },
  {
    question: 'Can I edit my resume before applying?',
    answer:
      'Yes. Nexthire allows you to review and edit resume content before submitting an application.',
    icon: IconEdit,
  },
  {
    question: 'Can I manage multiple job applications together?',
    answer:
      'Yes. Saved jobs and submitted applications are organized in your dashboard for easier tracking.',
    icon: IconChecklist,
  },
  {
    question: 'What is included in Premium?',
    answer:
      'Premium adds AI-based resume support, advanced profile improvements, and access to upcoming productivity features.',
    icon: IconCreditCard,
  },
  {
    question: 'Are more features being added?',
    answer:
      'Yes. Upcoming improvements include profile insights, smarter recommendations, and expanded resume workflows.',
    icon: IconRocket,
  },
];
