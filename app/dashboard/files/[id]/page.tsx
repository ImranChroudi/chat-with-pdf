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
    <div className="grid h-screen grid-cols-1 overflow-hidden lg:grid-cols-6">
      <div className="col-span-5 overflow-auto bg-[#F5F3EE] lg:col-span-3">
        <PdfView url={downloadUrl} />
      </div>

      <div className="col-span-5 flex flex-col overflow-hidden border-t border-[#E4E2DC] lg:col-span-3 lg:border-l lg:border-t-0">
        <ChatComponent id={id} />
      </div>
    </div>
  );
}

export default ChatFilePage;