import { auth } from "@clerk/nextjs/server";
import PlaceholderDocuments from "./PlaceholderDocuments";
import { adminDb } from "@/firebaseAdmin";
import { FileText } from "lucide-react";

async function Document({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth.protect();

  const documentsSnapshot = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .get();

  return (
    <div className="[font-family:var(--font-body)] mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-10">
      {!documentsSnapshot.empty ? (
        <>
          <h1 className="[font-family:var(--font-display)] text-3xl font-medium text-[#14161F]">
            My Documents
          </h1>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documentsSnapshot.docs.map((doc) => {
              const fileData = doc.data();
              return (
                <div
                  key={doc.id}
                  className="group flex items-start gap-3 rounded-xl border border-[#E4E2DC] bg-[#FAFAF7] p-4 transition-all hover:border-[#4F46E5]/40 hover:shadow-[0_12px_32px_-20px_rgba(20,22,31,0.4)]"
                >
                  <div className="flex flex-shrink-0 items-center justify-center rounded-[8px] bg-[#14161F] p-2 text-[#FFE066] transition-colors group-hover:bg-[#4F46E5]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-medium text-[#14161F]">
                      {fileData.name}
                    </h2>
                    <p className="mt-1 truncate text-xs text-[#4A4D57]">
                      {fileData.url}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center px-6 text-center">
          <PlaceholderDocuments />
          <p className="mt-4 max-w-sm text-sm text-[#4A4D57]">
            No documents found. Please upload a document to get started.
          </p>
        </div>
      )}
    </div>
  );
}

export default Document;
