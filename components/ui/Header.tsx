import { UserButton, SignedIn } from "@clerk/nextjs";
import Link from "next/link";

function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <Link href="/dashboard" className="text-lg font-bold">
        Chat with PDF
      </Link>


      <SignedIn>
        <div>
            <UserButton />
        </div>
      </SignedIn>


      
    </header>
  );
}

export default Header;