"use client";

import { Room } from "@/components/Room";
import { Editor } from "@/components/Editor";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function JoinPage() {
  return (
    <div className={`${spaceGrotesk.className} min-h-screen text-gray-900`}>
      <Room>
        <div className="container mx-auto px-4 py-8">
          <Editor />
        </div>
      </Room>
    </div>
  );
}