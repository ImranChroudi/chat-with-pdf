import Link from "next/link";
import { Plus } from "lucide-react";

function DashboardPage() {
  return (
    <div className="[font-family:var(--font-body)] flex min-h-screen flex-col py-10 max-w-6xl mx-auto gap-6  px-6">
      <h1 className="[font-family:var(--font-display)] text-3xl font-medium text-[#14161F]">
        My Documents
      </h1>

      <Link
        href="/dashboard/upload"
        className="group flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E4E2DC] bg-[#F5F3EE] text-[#4A4D57] transition-colors hover:border-[#4F46E5] hover:bg-[#EEF0FF] hover:text-[#14161F]"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#14161F] transition-colors group-hover:bg-[#4F46E5]">
          <Plus className="h-5 w-5 text-[#FFE066]" />
        </div>
        <span className="text-sm font-medium">Add document</span>
      </Link>
    </div>
  );
}

export default DashboardPage;