import type {
  CreateChatCompletionRequest,
  ChatCompletionRequestMessage,
} from "openai";
import { OpenAIStream } from "@/lib/OpenAIStream";
import { getTokens } from "@/lib/tokenizer";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_KEY env variable not set");
}

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  const requestData = await req.json();

  if (!requestData) {
    throw new Error("No request data");
  }

  const newArr = requestData.messages.map(({id, ...rest}) => {
    return rest;
  });

  console.log(`Message state entering api is: ${JSON.stringify(newArr)}`);

  const reqMessages: ChatCompletionRequestMessage[] = newArr;

  if (!reqMessages) {
    throw new Error("no messages provided");
  }

  //   let tokenCount = 0;

  //   reqMessages.forEach((msg) => {
  //     const tokens = getTokens(msg.content);
  //     tokenCount += tokens;
  //   });

  //   const moderationRes = await fetch("https://api.openai.com/v1/moderations", {
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  //     },
  //     method: "POST",
  //     body: JSON.stringify({
  //       input: reqMessages[reqMessages.length - 1].content,
  //     }),
  //   });

  //   const moderationData = await moderationRes.json();
  //   const [results] = moderationData.results;

  //   if (results.flagged) {
  //     throw new Error("Query flagged by openai");
  //   }

  const prompt =
    "You are an AI assistant and must respond in a markdown format";

  //   tokenCount += getTokens(prompt);

  //   if (tokenCount >= 4000) {
  //     throw new Error("Query too large");
  //   }

  const messages: ChatCompletionRequestMessage[] = [
    // { role: "system", content: prompt },
    ...reqMessages,
  ];

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  };

  const payload: CreateChatCompletionRequest = {
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.01,
    max_tokens: process.env.AI_MAX_TOKENS
      ? parseInt(process.env.AI_MAX_TOKENS)
      : 500,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    user: requestData?.user,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
};

export default handler;
