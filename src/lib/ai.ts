import OpenAI from "openai";
import { ResponsesModel } from "openai/resources/shared";

const client = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY
});

export const callLLm = async (input: string, model: ResponsesModel = "gpt-4o"): Promise<any> => {
  return client.responses.create({
    model,
    input
  });
}


