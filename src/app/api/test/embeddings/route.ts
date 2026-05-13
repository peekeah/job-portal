import { NextRequest, NextResponse } from 'next/server';
import { generateResumeEmbedding, generateJobEmbedding } from '@/lib/embeddings';

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    let embedding;
    let content;

    if (type === 'resume') {
      content = `Resume for ${data.personalInfo?.name || 'Unknown'} with skills: ${data.skills?.join(', ') || 'None'}`;
      embedding = await generateResumeEmbedding(data);
    } else if (type === 'job') {
      content = `Job: ${data.job_role} at ${data.location || 'Unknown'}, skills required: ${data.skills_required?.join(', ') || 'None'}`;
      embedding = await generateJobEmbedding(data);
    } else {
      return NextResponse.json(
        { status: false, error: 'Invalid type. Must be "resume" or "job"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: true,
      data: {
        type,
        content,
        embedding_length: embedding.length,
        sample_values: embedding.slice(0, 5), // First 5 values for verification
        embedding_preview: `${embedding.slice(0, 3).join(', ')}...[${embedding.length} total]`
      }
    });
  } catch (error) {
    console.error('Embedding test error:', error);
    return NextResponse.json(
      { 
        status: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
