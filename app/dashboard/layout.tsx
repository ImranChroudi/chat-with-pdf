import Header from "@/components/ui/Header";
import { ClerkProvider } from "@clerk/nextjs";

function dashboardLayout({ children }: { children: React.ReactNode }) {
  return (
        <ClerkProvider>

          <Header />
          <div>
            {children}
          </div>
        </ClerkProvider>
       
  )
}

export default dashboardLayout