import Link from "next/link";

interface FooterProps {
  variant?: 'fixed' | 'static';
}

export default function Footer({ variant = 'static' }: FooterProps) {
  const baseClasses = "bg-white/80 backdrop-blur-sm border-t border-gray-200 py-3";
  const variantClasses = variant === 'fixed' 
    ? "fixed bottom-0 left-0 right-0 z-10" 
    : "relative";

  return (
    <footer className={`${baseClasses} ${variantClasses}`}>
      <div className="w-full px-[5px] md:px-4">
        <div className="flex flex-col items-center space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex-1 hidden md:block"></div>
          <p className="text-sm text-gray-600 text-center flex-1">
            © 2025 Fluo. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-end space-y-1 sm:space-y-0 sm:space-x-4 flex-1">
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
