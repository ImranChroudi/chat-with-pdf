'use server'

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateEmbeddingInPineconeVectorStore } from "@/lib/langChain";
export async function generateEmbedding(docId : string){
    console.log("Generating embedding for docId:", docId);
    if (!(await auth()).isAuthenticated) {
        throw new Error("User is not authenticated");
    }

    await generateEmbeddingInPineconeVectorStore(docId);
    console.log("Embedding generated for docId:", docId);

    revalidatePath(`/dashboard/`);

    return {completed: true};

}