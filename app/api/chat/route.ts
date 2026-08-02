import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  generateText,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '@/firebase';
import { auth, useUser } from '@clerk/nextjs';
import { askQuestion } from '@/actions/askQuestion';

export async function POST(req : any) {
  
  const { id , question } = await req.json();
    console.log("message" , question , id);

  const { success , message} = await askQuestion(id , question);


  console.log("message" , message);
  return {
    success,
    message
  }
}