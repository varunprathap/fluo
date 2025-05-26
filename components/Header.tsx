"use client";

import Link from "next/link";
import { Settings, Mail, Info } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-2xl px-4">
      <nav className="bg-white/80 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Fluo
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/about" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <Info size={16} />
              <span className="hidden md:inline">About</span>
            </Link>
            <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <Settings size={16} />
              <span className="hidden md:inline">Admin</span>
            </Link>
            <a href="mailto:varun@vibing.com.au" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <Mail size={16} />
              <span className="hidden md:inline">Contact</span>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
