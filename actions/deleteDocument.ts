"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import cloudinary from "@/lib/cloudinary";
import pineconeClient from "@/lib/pineconeClient";
import { adminDb } from "@/firebaseAdmin";

const indexName = "newindex";

export interface DeleteDocumentResult {
  success: boolean;
  message?: string;
}

function publicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
  return match ? match[1] : null;
}

async function deleteDocument(docId: string): Promise<DeleteDocumentResult> {
  const { userId } = await auth.protect();

  try {
    const docRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("files")
      .doc(docId);

    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return { success: false, message: "Document not found." };
    }

    const data = snapshot.data() as
      | { url?: string; publicId?: string }
      | undefined;

    const publicId =
      data?.publicId ?? (data?.url ? publicIdFromUrl(data.url) : null);

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Failed to delete Cloudinary asset:", err);
      }
    }

    try {
      await pineconeClient.Index(indexName).namespace(docId).deleteAll();
    } catch (err) {
      console.error("Failed to delete Pinecone namespace:", err);
    }

    await adminDb.recursiveDelete(docRef);

    revalidatePath("/dashboard/documents");

    return { success: true };
  } catch (err) {
    console.error("Failed to delete document:", err);
    return { success: false, message: "Failed to delete document." };
  }
}

export default deleteDocument;
