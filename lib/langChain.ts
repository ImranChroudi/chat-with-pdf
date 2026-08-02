import { auth } from "@clerk/nextjs/server";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { adminDb } from "@/firebaseAdmin";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { extractText, getDocumentProxy } from "unpdf";
import pineconeClient from "@/lib/pineconeClient";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createHistoryAwareRetriever } from "@langchain/classic/chains/history_aware_retriever";
import { createStuffDocumentsChain } from "@langchain/classic/chains/combine_documents";
import { createRetrievalChain } from "@langchain/classic/chains/retrieval";
import { MessagesPlaceholder } from "@langchain/core/prompts";

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-5.4-mini",
});

export const indexName = "newindex";

export async function generateDocs(docId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  const firebaseRef = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .get();

  const downloadUrl = firebaseRef.data()?.url;
  if (!downloadUrl) throw new Error("File not found");

  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch PDF: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("pdf")) {
    throw new Error(`Expected a PDF but got content-type: ${contentType}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  console.log("PDF byte length:", arrayBuffer.byteLength);

  const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
  const { text, totalPages } = await extractText(pdf, { mergePages: false });

  console.log("Total pages:", totalPages);
  text.forEach((t, i) => console.log(`Page ${i + 1} char count:`, t.length));

  const docs = text
    .map(
      (pageText, i) =>
        new Document({
          pageContent: pageText,
          metadata: { docId, page: i + 1, totalPages },
        }),
    )
    .filter((doc) => doc.pageContent.trim().length > 0);

  if (docs.length === 0) {
    throw new Error(
      "No extractable text found in this PDF. It may be a scanned/image-based document that requires OCR.",
    );
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splitDocs = await splitter.splitDocuments(docs);
  console.log(`--- split into ${splitDocs.length} parts ---`);

  if (splitDocs.length === 0) {
    throw new Error(
      "Text splitting produced 0 chunks — check splitter config or source text.",
    );
  }

  return splitDocs;
}

async function namespaceExists(index: any, namespace: string) {
  if (!namespace) throw new Error("namespace not provided");
  const { namespaces } = await index.describeIndexStats();
  return !!namespaces?.[namespace];
}

export async function generateEmbeddingInPineconeVectorStore(docId: string) {
  console.log("Generating embedding for docId:", docId);
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set in this environment. Check .env.local and restart the dev server.",
    );
  }

  let pineconeVectoreStore;
  console.log("--- Generating embedding... ---");

  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-3-small",
    maxRetries: 2, // fail faster instead of retrying for ~90s before giving up
  });

  const index = pineconeClient.Index(indexName);
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

  // --- Canary check: embed a single small string first so failures are ---
  // --- reported clearly instead of surfacing as a confusing Pinecone error ---
  try {
    console.log("--- Testing embeddings connection ---");
    const testVector = await embeddings.embedQuery("connection test");
    console.log("Embedding dimension:", testVector.length);
  } catch (err: any) {
    console.error("OpenAI embeddings call failed:", err);
    const message =
      err?.error?.message ||
      err?.message ||
      "Unknown error calling OpenAI embeddings API";
    throw new Error(
      `Failed to generate embeddings via OpenAI. This usually means an invalid API key, ` +
        `exhausted quota, or rate limiting. Underlying error: ${message}`,
    );
  }

  console.log(
    `--- Storing ${splitDocs.length} embeddings in namespace "${docId}" ---`,
  );
  console.log(
    "This can take a minute or two, depending on the number of chunks.",
    splitDocs,
  );
  try {
    pineconeVectoreStore = await PineconeStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        pineconeIndex: index,
        namespace: docId,
      },
    );
  } catch (err: any) {
    console.error("Pinecone upsert failed:", err);
    throw new Error(
      `Failed to store embeddings in Pinecone. Underlying error: ${err?.message || err}`,
    );
  }

  console.log("--- Successfully stored embeddings ---");

  return pineconeVectoreStore;
}

export async function fetchMessagesFromDb(docId: string) {
  const { userId } = await auth.protect();

  if (!userId) {
    throw new Error("User not found");
  }

  const LIMIT = 25;

  const refChatHistory = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .collection("chat")
    .orderBy("createdAt", "desc")
    .limit(LIMIT)
    .get();

  const chatHistory = refChatHistory.docs.map((doc) => {
    return doc.data().role === "human"
      ? new HumanMessage(doc.data().content)
      : new AIMessage(doc.data().content);
  });

  return chatHistory;
}

export async function generateLangChainCompletion(
  docId: string,
  question: string,
) {
  let pineconeVectorStore;

  pineconeVectorStore = await generateEmbeddingInPineconeVectorStore(docId);

  console.log("Initializing LangChain...");

  if (!pineconeVectorStore) {
    throw new Error("Pinecone vectore store not found");
  }

  const retriver = pineconeVectorStore.asRetriever();

  const chatHistory = await fetchMessagesFromDb(docId);

  console.log("--- defining a prompt template ---");

  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `Given a chat history and the latest user question,
rewrite the latest question into a standalone question.
Do not answer the question.`,
    ],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
  ]);

  const historyAwareRetriverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever: retriver,
    rephrasePrompt: historyAwarePrompt,
  });

  console.log("--- defining a prompt template ---");

  const qaPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `Answer the user's question using ONLY the following context.

{context}`,
    ],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
  ]);

  console.log("--- defining a prompt template ---");
  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: qaPrompt,
  });

  const conversationalRetrivalChain = await createRetrievalChain({
    retriever: historyAwareRetriverChain,
    combineDocsChain: historyAwareCombineDocsChain,
  });

  console.log(chatHistory);

  const reply = await conversationalRetrivalChain.invoke({
    chat_history: chatHistory,
    input: question,
  });

  console.log(reply.answer);

  return reply.answer;
}

export { model };
