import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '@/firebase';
import { auth } from '@clerk/nextjs';

export async function POST(req: Request) {
  
  //const { user } = await auth.protect();
  const { messages }: { messages: UIMessage[] } = await req.json();
  
  console.log(messages[0].parts[0]);

//   await db.collection("users").doc(user.id).collection("files").doc(fileId).collection("chat").add({
//     role: message.role,
//     content: message.content
//   })

  const result = streamText({
    model: openai('gpt-5.1'),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}