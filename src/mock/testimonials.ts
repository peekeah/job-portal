export type Testimonial = {
  name: string;
  role: string;
  image: string;
  quote: string;
};

export const testimonials = [
  {
    name: 'James Carter',
    role: 'Software Engineer',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    quote:
      'Got my first callback within a week. The resume editor made the difference.',
  },
  {
    name: 'Sarah Mitchell',
    role: 'Product Manager',
    image: 'https://randomuser.me/api/portraits/women/4.jpg',
    quote:
      'I had been applying on other platforms for two months with no response. Switched to NextHire, used the AI enhancement on my resume, and had three interviews scheduled within ten days.',
  },
  {
    name: 'Daniel Harris',
    role: 'Data Analyst',
    image: 'https://randomuser.me/api/portraits/men/7.jpg',
    quote:
      'Clean platform, relevant listings, and I could actually track where each application stood.',
  },
  {
    name: 'Emily Thomson',
    role: 'UX Designer',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    quote:
      'The edit before apply feature is something every job platform should have. I stopped sending the same generic resume to every role and the response rate improved noticeably.',
  },
  {
    name: 'Ethan Walker',
    role: 'Backend Engineer',
    image: 'https://randomuser.me/api/portraits/men/5.jpg',
    quote:
      'The job recommendations got better the more I used it. By the second week it was surfacing roles I would have spent hours searching for manually.',
  },
  {
    name: 'Charlotte Evans',
    role: 'Business Analyst',
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    quote:
      'Finally a job platform where I know the status of every application I have sent.',
  },
  {
    name: 'Oliver Bennett',
    role: 'Fullstack Developer',
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
    quote:
      'I was skeptical about another job platform but NextHire felt different from the start. The listings were relevant, the companies were real, and the application process was straightforward. What I did not expect was how useful the AI resume tool would be — it rewrote my experience section in a way that actually sounded like me, just clearer. Landed a role at a startup I had been following for a year.',
  },
  {
    name: 'Laura Hopkins',
    role: 'HR Associate',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
    quote:
      'We posted our first job listing and had qualified applicants within 24 hours. The verification process keeps the quality high on both sides.',
  },
];
