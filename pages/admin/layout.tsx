import Link from 'next/link';
import { Home, Users, Activity, CreditCard, Settings, MoreHorizontal, Menu, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isProductsExpanded, setIsProductsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState('0px');

  // Calculate the height of the expanded content
  useEffect(() => {
    const calculateHeight = () => {
      const element = document.getElementById('expandable-content');
      if (element) {
        const height = element.scrollHeight;
        setExpandedHeight(`${height}px`);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6">
        {/* Logo and Title */}
        <div className="flex items-center mb-8">
          <div className="w-8 h-8">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="currentColor" d="M4.5 4.5v15h15v-15h-15zm1.5 1.5h12v12H6v-12z"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold ml-2">Admin console</h2>
          <button 
            className="ml-auto -mr-4 p-2 rounded-lg hover:bg-gray-700 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Team Section */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-4">Team</p>
          <nav className="space-y-2">
            <Link 
              href="/admin" 
              className={`flex items-center space-x-3 py-2 text-sm ${
                router.pathname === '/admin' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/admin/members"
              className={`flex items-center space-x-3 py-2 text-sm ${
                router.pathname === '/admin/members'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Members</span>
            </Link>
            <Link 
              href="/admin/groups"
              className={`flex items-center space-x-3 py-2 text-sm ${
                router.pathname === '/admin/groups'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Groups</span>
            </Link>
            <Link 
              href="/admin/activity"
              className={`flex items-center space-x-3 py-2 text-sm ${
                router.pathname === '/admin/activity'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span>Activity</span>
            </Link>
            <Link 
              href="/admin/billing"
              className={`flex items-center space-x-3 py-2 text-sm ${
                router.pathname === '/admin/billing'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Billing</span>
            </Link>
            <Link 
              href="/admin/settings"
              className={`flex items-center space-x-3 py-2 text-sm ${
                router.pathname === '/admin/settings'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <Link 
              href="/admin/support"
              className={`flex items-center space-x-3 py-2 text-sm ${
                router.pathname === '/admin/support'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Premium Support</span>
            </Link>
            <button 
              className="flex items-center space-x-3 py-2 text-sm text-gray-400 hover:text-white w-full"
            >
              <MoreHorizontal className="w-5 h-5" />
              <span>More</span>
            </button>
          </nav>
        </div>

        {/* Products Section */}
        <div className="mt-8">
          <p className="text-sm text-gray-500 mb-4">Products</p>
          <div className="space-y-1">
            <div className="group">
              <button 
                onClick={() => setIsProductsExpanded(!isProductsExpanded)}
                className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-white py-2"
              >
                <span>fluo</span>
                <svg 
                  className={`w-4 h-4 transform transition-transform ${isProductsExpanded ? 'rotate-180' : ''}`} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                id="expandable-content"
                className={`pl-4 space-y-2 overflow-hidden transition-all duration-200`}
                style={{ maxHeight: isProductsExpanded ? expandedHeight : '0', opacity: isProductsExpanded ? 1 : 0 }}
              >
                <Link 
                  href="/admin/dash/overview" 
                  className={`block py-2 text-sm ${
                    router.pathname === '/admin/dash/overview'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Overview
                </Link>
                <Link 
                  href="/admin/dash/apps" 
                  className={`block py-2 text-sm ${
                    router.pathname === '/admin/dash/apps'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Apps
                </Link>
                <Link 
                  href="/admin/dash/protect" 
                  className={`block py-2 text-sm ${
                    router.pathname === '/admin/dash/protect'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Protect and control
                </Link>
                <Link 
                  href="/admin/dash/history" 
                  className={`block py-2 text-sm ${
                    router.pathname === '/admin/dash/history'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Action history
                </Link>
                <Link 
                  href="/admin/dash/settings" 
                  className={`block py-2 text-sm ${
                    router.pathname === '/admin/dash/settings'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Home button at bottom */}
      <div className="p-6 border-t border-gray-800">
        <Link 
          href="/" 
          className="flex items-center space-x-3 py-2 text-sm text-gray-400 hover:text-white group"
        >
          <Home className="w-5 h-5 group-hover:text-white" />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } z-50`}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center p-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-500 hover:text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
} 