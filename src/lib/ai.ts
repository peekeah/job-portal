import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { getEnv } from './config';

/**
 * LangChain compatible model instance.
 * Used for general LLM calls, streaming, and LangGraph agents.
 */
export const llm = new ChatOpenAI({
  apiKey: getEnv('OPENAI_API_KEY'),
  modelName: 'gpt-4o',
  temperature: 0.3,
});

/**
 * LangChain compatible embeddings instance.
 * Used for vector storage operations and similarity searches.
 */
export const embeddings = new OpenAIEmbeddings({
  apiKey: getEnv('OPENAI_API_KEY'),
  modelName: 'text-embedding-3-small',
});
