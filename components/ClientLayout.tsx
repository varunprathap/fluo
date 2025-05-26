"use client";
import { Space_Grotesk } from "next/font/google";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");

  if (isHome) {
    // Special layout for home page - let it handle its own header/footer
    return (
      <div className={`${spaceGrotesk.className} min-h-screen flex flex-col bg-white`}>
        <Header />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`${spaceGrotesk.className} min-h-screen flex flex-col bg-white`}>
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main
        className={
          isHome
            ? "flex-1 w-full px-0 py-0"
            : "flex-1 w-full px-0 py-0"
        }
      >
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}