"use client";

import { useTransition } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import { collection, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { FileText, Loader2Icon, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import deleteDocument from "@/actions/deleteDocument";
import PlaceholderDocuments from "./PlaceholderDocuments";

interface FileData {
  name: string;
  url?: string;
  size?: number;
}

function DocumentList() {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();

  const [snapshot, loading] = useCollection(
    user &&
      query(
        collection(db, "users", user?.id, "files"),
        orderBy("createdAt", "desc"),
      ),
  );

  const documents = snapshot?.docs ?? [];

  const handleDelete = (docId: string, name: string) => {
    if (
      !window.confirm(
        `Delete "${name}"? This also removes its chat history and embeddings.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteDocument(docId);
      if (result.success) {
        toast.success("Document deleted");
      } else {
        toast.error(result.message ?? "Failed to delete document");
      }
    });
  };

  if (!user || loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <Loader2Icon className="h-6 w-6 animate-spin text-[#4F46E5]" />
        <p className="text-sm text-[#8A8D97]">Loading your documents…</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
        <PlaceholderDocuments />
        <p className="mt-4 max-w-sm text-sm text-[#4A4D57]">
          No documents found. Please upload a document to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <PlaceholderDocuments />

      {documents.map((doc) => {
        const fileData = doc.data() as FileData;
        return (
          <div
            key={doc.id}
            className="group flex items-start gap-3 rounded-xl border border-[#E4E2DC] bg-[#FAFAF7] p-4 transition-all hover:border-[#4F46E5]/40 hover:shadow-[0_12px_32px_-20px_rgba(20,22,31,0.4)]"
          >
            <Link
              href={`/dashboard/files/${doc.id}`}
              className="flex min-w-0 flex-1 items-start gap-3"
            >
              <div className="flex flex-shrink-0 items-center justify-center rounded-[8px] bg-[#14161F] p-2 text-[#FFE066] transition-colors group-hover:bg-[#4F46E5]">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-medium text-[#14161F]">
                  {fileData.name}
                </h2>
                <p className="mt-1 text-xs text-[#4A4D57]">
                  {fileData.size
                    ? `${(fileData.size / 1000000).toFixed(2)} MB`
                    : "PDF"}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => handleDelete(doc.id, fileData.name)}
              disabled={isPending}
              className="shrink-0 rounded-md p-1.5 text-[#8A8D97] transition-colors hover:bg-[#F5F3EE] hover:text-[#DC2626] disabled:opacity-50"
              aria-label={`Delete ${fileData.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default DocumentList;
