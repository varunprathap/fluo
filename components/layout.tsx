import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { Zap, Info } from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${spaceGrotesk.className} min-h-screen bg-[#F8F7FF]`}>
      {/* Navigation */}
      <div className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4">
         
        </div>
      </div>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
} 