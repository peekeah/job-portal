import OpenAI from "openai";
import { ResponsesModel } from "openai/resources/shared";
import { getEnv } from "./config";

const client = new OpenAI({
  apiKey: getEnv("OPENAI_API_KEY")
});

export const callLLm = async (input: string, model: ResponsesModel = "gpt-4o", temperature?: number, topP?: number): Promise<any> => {
  return client.responses.create({
    model,
    input,
    temperature,
    top_p: topP,
  });
}


