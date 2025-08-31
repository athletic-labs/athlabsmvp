'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingCart, Save, Calendar, History, Settings, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme/theme-provider';
import { AuthService } from '@/lib/auth/auth-service';

const NAVIGATION_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/new-order', label: 'New Order', icon: ShoppingCart },
  { href: '/saved-templates', label: 'Saved Templates', icon: Save },
  { href: '/calendar', label: 'Team Calendar', icon: Calendar },
  { href: '/order-history', label: 'Order History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await AuthService.signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold">Athletic Labs</h1>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors">
              {resolvedTheme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span>{resolvedTheme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            
            <button onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="lg:hidden bg-white dark:bg-navy shadow-md p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-smoke/20 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Athletic Labs</h1>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}