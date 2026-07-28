import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { FilePlus } from "lucide-react";

function Header() {
  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-[#E4E2DC] bg-[#FAFAF7]/90 px-6 py-4 backdrop-blur">
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#14161F]">
          <span className="h-2.5 w-2 border-l-0 border border-[#FFE066]" />
        </span>
        <span className="[font-family:var(--font-mono)] text-[13px] font-medium uppercase tracking-[0.14em] text-[#14161F]">
          Chat with PDF
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button className="h-10 cursor-pointer rounded-md bg-[#14161F] px-5 text-sm font-medium text-[#FAFAF7] transition-colors hover:bg-[#4F46E5] sm:h-11 sm:px-6">
              Sign in
            </Button>
          </SignInButton>
        </Show>

        <Show when="signed-in">
          <Button
            
            variant="ghost"
            className="h-10 rounded-md px-4 text-sm font-medium text-[#4A4D57] transition-colors hover:bg-transparent hover:text-[#14161F] sm:h-11 sm:px-5"
          >
            <Link href="/dashboard/upgrade">Pricing</Link>
          </Button>

          <Button
            
            variant="ghost"
            className="h-10 rounded-md px-4 text-sm font-medium text-[#4A4D57] transition-colors hover:bg-transparent hover:text-[#14161F] sm:h-11 sm:px-5"
          >
            <Link href="/dashboard/documents">My documents</Link>
          </Button>

          <Button
            className="h-10 cursor-pointer rounded-md bg-[#14161F] px-5 text-sm font-medium text-[#FAFAF7] transition-colors hover:bg-[#4F46E5] sm:h-11 sm:px-6"
          >
            <Link href="/dashboard/upload" className="flex items-center gap-2">
              <FilePlus className="h-4 w-4" />
              Upload
            </Link>
          </Button>

          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 rounded-[6px] border border-[#E4E2DC]",
              },
            }}
          />
        </Show>
      </div>
    </header>
  );
}

export default Header;