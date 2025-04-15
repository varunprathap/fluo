import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { Zap, Info, Home, MessageCircle, LogIn } from "lucide-react";
import { Flex } from "@aws-amplify/ui-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${spaceGrotesk.className} flex flex-col h-screen`}>
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
        <div className="flex flex-row min-h-[3vh] justify-center p-[10px] mt-[10px] border border-gray-400 w-[50vw] mx-auto rounded-[20px]">
          <Flex className="items-center space-x-[50px] border border-gray-400 rounded-lg p-4 w-fit">
            <Link href="/" className="flex items-center gap-2 text-lg font-medium hover:text-purple-600 transition-colors group">
              <Home className="w-5 h-5" />
              <span className="hidden md:inline">Home</span>
            </Link>
            {/* <Link href="/how-it-works" className="flex items-center gap-2 text-lg font-medium hover:text-purple-600 transition-colors group">
              <MessageCircle className="w-5 h-5" />
              <span className="hidden md:inline">How it Works</span>
            </Link> */}
            <Link href="/join" className="flex items-center gap-2 text-lg font-medium hover:text-purple-600 transition-colors group">
              <LogIn className="w-5 h-5" />
              <span className="hidden md:inline">Join the Fluo</span>
            </Link>
          </Flex>
        </div>
      </div>
      <main className="pt-[80px]">{children}</main>
      <div className="flex justify-center items-center h-full">
        <p>© 2025 Fluo. All rights reserved.</p>
      </div>
    </div>
  );
} 