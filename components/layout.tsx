import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { Zap, Info } from "lucide-react";
import { Flex } from "@aws-amplify/ui-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${spaceGrotesk.className} flex flex-col min-h-screen bg-white`}>
          <div className="flex flex-row min-h-[3vh] justify-center p-[10px] mt-[10px] border border-gray-200 w-[70vw] mx-auto rounded-[20px]">
            <Flex className="items-center space-x-[50px] border border-gray-300 rounded-lg p-4 w-fit">
              <Link href="/" className="text-lg font-medium hover:text-purple-600 transition-colors">
                Home
              </Link>
              <Link href="/how-it-works" className="text-lg font-medium hover:text-purple-600 transition-colors">
                How it Works
              </Link>
              <Link href="/login" className="text-lg font-medium hover:text-purple-600 transition-colors">
                Join the flou
              </Link>
            </Flex>
          </div>
      <main>{children}</main>
    </div>
  );
} 