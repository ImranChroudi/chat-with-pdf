import { auth } from "@clerk/nextjs/server";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import pineconeClient from "./pinecone.ts";
import { PineconeStore } from "@langchain/pinecone";
import { adminDb } from "@/firebaseAdmin.js";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const nodal = new ChatOpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-5.4-mini",
});

export const indexName = "chat-with-pdf";

export async function generateDocs(docId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }

  const firebaseRef = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .get();

    const downloadUrl = firebaseRef.data()?.url;

  if (!downloadUrl) {
    throw new Error("File not found");
  }

  const response = await fetch(downloadUrl);

  const data = await response.blob();

  const loader = new PDFLoader(data);
  const docs = await loader.load();

  const spliter = new RecursiveCharacterTextSplitter();

  const splitDocs = await spliter.splitDocuments(docs);
  console.log(`--- split into ${splitDocs.length} parts ---`);
   
  return splitDocs;

}
async function namespaceExists(index: any, namespace: string) {
  if (!namespace) {
    throw new Error("namespace not provided");
  }

  const { namespaces } = await index.describeIndexStats();
  return namespaces.includes(namespace);
}
export async function generateEmbeddingInPineConeVectorStore(docId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }

  let pineconeVectoreStore;
  // generte embedding
  console.log("--- Generating e,bedding... ---");

  const embeddings = new OpenAIEmbeddings();

  const index = await pineconeClient.index(indexName);
  const namespaceAlreadyExists = await namespaceExists(index, docId);

  if (namespaceAlreadyExists) {
    console.log("Namespace already exists");

    pineconeVectoreStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: docId,
    });
    return pineconeVectoreStore;
  }

  const splitDocs = await generateDocs(docId);

  console.log("storing the embeddings in namespace");
   
  
}
