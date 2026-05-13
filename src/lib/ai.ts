import OpenAI from 'openai';
import { ResponsesModel } from 'openai/resources/shared';
import { getEnv } from './config';

const client = new OpenAI({
  apiKey: getEnv('OPENAI_API_KEY'),
});

type Item = {
  text: string;
};

type Content = {
  content: Item[];
};

interface OpenAIResponse extends Omit<OpenAI.Responses.Response, 'output'> {
  output: Content[];
}

export const callLLm = async (
  input: string,
  model: ResponsesModel = 'gpt-4o',
  temperature?: number,
  topP?: number,
): Promise<OpenAIResponse> => {
  return client.responses.create({
    model,
    input,
    temperature,
    top_p: topP,
  }) as Promise<OpenAIResponse>;
};


export const getEmbeddings = async (input: string, model?: string): Promise<number[]> => {
  const response = await client.embeddings.create({
    model: model ?? 'text-embedding-3-small',
    input,
    encoding_format: 'float',
  });
  
  return response.data[0].embedding;
};
