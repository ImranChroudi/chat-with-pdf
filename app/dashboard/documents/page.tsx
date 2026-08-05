import DocumentList from "@/components/DocumentList";

function DocumentsPage() {
  return (
    <div className="[font-family:var(--font-body)] mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-10">
      <h1 className="[font-family:var(--font-display)] text-3xl font-medium text-[#14161F]">
        My Documents
      </h1>
      <DocumentList />
    </div>
  );
}

export default DocumentsPage;
