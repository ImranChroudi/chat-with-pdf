'use server'

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function generateEmbedding(docId : string){
    auth().protect(); 

    await generateEmbeddingInPineconeVectorStore(docId);

    revalidatePath(`/dashboard/`);

    return {completed: true};

}