"use client";
import Link from "next/link";
import { Home, Settings } from "lucide-react";
import { Space_Grotesk } from "next/font/google";
import { usePathname } from "next/navigation";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className={`${spaceGrotesk.className} min-h-screen flex flex-col bg-white`}>
      {/* Top Navigation Bar (hide on admin pages) */}
      {!isAdmin && (
        <nav className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-8 px-6 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-medium hover:text-purple-600 transition-colors group">
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link href="/admin" className="flex items-center gap-2 text-lg font-medium hover:text-purple-600 transition-colors group">
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </nav>
      )}
      {/* Main Content */}
      <main
        className={
          isHome
            ? "flex-1 w-full max-w-3xl mx-auto px-4 py-8"
            : "flex-1 w-full px-0 py-0"
        }
      >
        {children}
      </main>
      {/* Footer (hide on admin pages) */}
      {!isAdmin && (
        <footer className="w-full border-t border-gray-200 py-4 text-center text-sm text-gray-500 mt-auto">
          © 2025 Fluo. All rights reserved.
        </footer>
      )}
    </div>
  );
} 