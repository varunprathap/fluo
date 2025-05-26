"use client";

import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function About() {
  return (
    <div className={`${spaceGrotesk.className} text-gray-900 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col`}>
      <Header />
      
      <main className="pt-24 pb-16 px-4 md:px-8 flex-1">
        <div className="max-w-4xl mx-auto">
          

          {/* Video Section */}
          <div className="mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/30">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                <video 
                  className="absolute top-0 left-0 w-full h-full rounded-lg object-cover"
                  controls
                  preload="metadata"
                  poster="/fluo-poster.jpg" // Optional: add a poster image
                >
                  <source src="/fluo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
