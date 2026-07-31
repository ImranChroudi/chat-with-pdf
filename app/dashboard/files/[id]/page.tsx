import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
import ChatComponent from "@/components/ChatComponent";
import PdfView from "@/components/PDFView";

async function ChatFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth.protect();

  const ref = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(id)
    .get();

  const fileData = ref.data();
  if (!fileData) throw new Error("File not found");

  const downloadUrl = fileData.url as string;
  if (!downloadUrl) throw new Error("File URL not found");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 h-screen overflow-hidden">
      <div className="col-span-5 lg:col-span-3 overflow-auto bg-gray-100">
        <PdfView url={downloadUrl} />
      </div>

      <div className="col-span-5 lg:col-span-3 border-t lg:border-t-0 lg:border-l overflow-hidden flex flex-col">
        <ChatComponent id={id} />
      </div>
    </div>
  );
}

export default ChatFilePage;