import { NextRequest, NextResponse } from 'next/server';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { errorHandler } from '@/lib/errorHandler';
import { parseResumeFromPdf } from '@/lib/resume-parser';
import { llm } from '@/lib/ai';
import { getResumeCritiquePrompt } from '@/constant/ai-prompts';
import { CustomError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const token = await authMiddleware(req, 'applicant');
    const body = await req.json();
    const resumeId = body?.resumeId as string | undefined;

    if (!resumeId) {
      throw new CustomError('Resume id is required', 400);
    }

    const applicant = await prisma.applicant.findFirst({
      where: {
        email: token.email
      }
    });

    if (!applicant) {
      throw new CustomError('user does not exist', 403);
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        applicant_id: applicant.id,
      },
    });

    if (!resume) {
      throw new CustomError('Resume not found', 404);
    }

    let parsedResume: unknown;
    if (resume.json) {
      parsedResume = resume.json;
    } else {
      if (resume.type !== 'pdf' || !resume.url) {
        throw new CustomError('Resume content is unavailable', 404);
      }
      parsedResume = await parseResumeFromPdf(resume.url);
    }

    // --- LangGraph Implementation ---

    // 1. Define Logic Node
    const critiqueNode = async (state: typeof MessagesAnnotation.State) => {
      const response = await llm.invoke(state.messages);
      return { messages: [response] };
    };

    // 2. Build Simple Graph (No tools needed for critique currently, but using graph for consistency)
    const workflow = new StateGraph(MessagesAnnotation)
      .addNode('critique', critiqueNode)
      .addEdge('__start__', 'critique')
      .addEdge('critique', '__end__');

    const app = workflow.compile();

    // 3. Execute with Streaming
    const prompt = getResumeCritiquePrompt(JSON.stringify(parsedResume));
    
    const stream = await app.streamEvents(
      { 
        messages: [
          new SystemMessage('You are a professional resume critic. Provide a detailed, constructive critique.'),
          new HumanMessage(prompt)
        ] 
      },
      { version: 'v2' }
    );

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const { event, data } of stream) {
          if (event === 'on_chat_model_stream' && data.chunk?.content) {
            controller.enqueue(encoder.encode(data.chunk.content));
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    const [resBody, status] = errorHandler(err);
    return NextResponse.json(resBody, status);
  }
}
