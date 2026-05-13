import { NextRequest, NextResponse } from 'next/server';
import { vectorStorage } from '@/lib/vector-storage';
import { generateResumeEmbedding, generateJobEmbedding } from '@/lib/embeddings';

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();

    switch (action) {
      case 'test-resume-similarity': {
        // Generate embedding for test resume
        const embedding = await generateResumeEmbedding(data.resume);
        
        // Find similar resumes
        const similarResumes = await vectorStorage.findSimilarResumes(embedding, 5);
        
        return NextResponse.json({
          status: true,
          data: {
            query_resume: data.resume.personalInfo?.name || 'Unknown',
            embedding_length: embedding.length,
            similar_resumes: similarResumes.map(item => ({
              resume_id: item.resume.id,
              applicant_name: item.resume.applicant?.name || 'Unknown',
              similarity: item.similarity
            }))
          }
        });
      }

      case 'test-job-similarity': {
        // Generate embedding for test job
        const embedding = await generateJobEmbedding(data.job);
        
        // Find similar jobs
        const similarJobs = await vectorStorage.findSimilarJobs(embedding, 5);
        
        return NextResponse.json({
          status: true,
          data: {
            query_job: data.job.job_role,
            embedding_length: embedding.length,
            similar_jobs: similarJobs.map(item => ({
              job_id: item.job.id,
              job_role: item.job.job_role,
              company: item.job.company?.name || 'Unknown',
              similarity: item.similarity
            }))
          }
        });
      }

      case 'test-storage': {
        const { type, id, embedding } = data;
        
        if (type === 'resume') {
          await vectorStorage.storeResumeEmbedding(id, embedding);
          const retrieved = await vectorStorage.getResumeEmbedding(id);
          
          return NextResponse.json({
            status: true,
            data: {
              stored: true,
              retrieved_length: retrieved?.length || 0,
              matches_original: retrieved?.length === embedding.length
            }
          });
        } else if (type === 'job') {
          await vectorStorage.storeJobEmbedding(id, embedding);
          const retrieved = await vectorStorage.getJobEmbedding(id);
          
          return NextResponse.json({
            status: true,
            data: {
              stored: true,
              retrieved_length: retrieved?.length || 0,
              matches_original: retrieved?.length === embedding.length
            }
          });
        }
        
        throw new Error('Invalid type. Must be "resume" or "job"');
      }

      default:
        throw new Error('Invalid action. Must be "test-resume-similarity", "test-job-similarity", or "test-storage"');
    }
  } catch (error) {
    console.error('Vector similarity test error:', error);
    return NextResponse.json(
      { 
        status: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
