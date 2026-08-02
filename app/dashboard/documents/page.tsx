import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebaseAdmin";
import { FileText } from "lucide-react";
import Link from "next/link";
import PlaceholderDocuments from "@/components/PlaceholderDocuments";


async function Document({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth.protect();

  const documentsSnapshot = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .get();

  return (
    <div className="flex flex-col h-full">
      {!documentsSnapshot.empty ? (
        <div className="flex flex-col h-full p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            My Documents
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           <div className="col-span-1  flex items-center justify-center">
             <PlaceholderDocuments/>
           </div>
            {documentsSnapshot.docs.map((doc) => {
              const fileData = doc.data();
              return (

                <Link href={`/dashboard/files/${doc.id}`} key={doc.id}>
                <div
                  key={doc.id}
                  className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 cursor-pointer"
                >
                  <div className="flex-shrink-0 rounded-lg bg-indigo-50 p-2 text-indigo-600 group-hover:bg-indigo-100">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold text-gray-900">
                      {fileData.name}
                    </h2>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {fileData.url}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <p className="text-xs font-medium text-gray-500">
                      {(fileData.size / 1000).toFixed(2) } MB
                    </p>
                  </div>
                </div>
                </Link>
              );
            })}
             

          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <PlaceholderDocuments/>
          <p className="mt-4 text-sm text-gray-500 max-w-sm">
            No documents found. Please upload a document to get started.
          </p>
        </div>
      )}
    </div>
  );
}

export default Document;