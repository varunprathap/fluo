"use client";
import { Space_Grotesk } from "next/font/google";
import { usePathname } from "next/navigation";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className={`${spaceGrotesk.className} min-h-screen flex flex-col bg-white`}>
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
    </div>
  );
}