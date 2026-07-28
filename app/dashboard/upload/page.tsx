import FileUploader from "@/components/FileUploader";

function UploadPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
      <FileUploader />
    </div>
  );
}

export default UploadPage;