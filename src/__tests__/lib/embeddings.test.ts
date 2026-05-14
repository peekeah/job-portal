import {
  generateResumeEmbedding,
  generateJobEmbedding,
} from '@/lib/embeddings';

// Test data
const testResume = {
  personalInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    location: 'San Francisco, CA',
  },
  workExperience: [
    {
      jobTitle: 'Software Engineer',
      company: 'Tech Corp',
      duration: '2020-2023',
      description: 'Developed web applications',
      responsibilities: [
        'Built React components',
        'Wrote unit tests',
        'Collaborated with team',
      ],
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science',
      institution: 'University of California',
      graduationYear: '2020',
      gpa: '3.8',
    },
  ],
  skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python'],
  projects: [
    {
      name: 'E-commerce Platform',
      description: 'Built a full-stack e-commerce site',
      technologies: 'React, Node.js, MongoDB',
    },
  ],
  summary:
    'Experienced software engineer with expertise in full-stack development',
};

const testJob = {
  job_role: 'Senior Frontend Developer',
  description:
    'We are looking for an experienced frontend developer to join our team. You will be responsible for building responsive web applications using modern JavaScript frameworks.',
  skills_required: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
  location: 'Remote',
  ctc: 150000,
  stipend: 0,
};

// Test function
export async function testEmbeddingGeneration() {
  try {
    const resumeEmbedding = await generateResumeEmbedding(testResume);
    const jobEmbedding = await generateJobEmbedding(testJob);

    // Verify embeddings are the correct size (OpenAI text-embedding-3-small produces 1536 dimensions)
    if (resumeEmbedding.length === 1536 && jobEmbedding.length === 1536) {
      return {
        success: true,
        resumeEmbeddingLength: resumeEmbedding.length,
        jobEmbeddingLength: jobEmbedding.length,
        message: 'Both embeddings have the correct dimension (1536)',
      };
    } else {
      return {
        success: false,
        resumeEmbeddingLength: resumeEmbedding.length,
        jobEmbeddingLength: jobEmbedding.length,
        message: 'Embeddings have incorrect dimensions',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Embedding generation failed',
    };
  }
}

// Export test data for use in other files
export { testResume, testJob };
