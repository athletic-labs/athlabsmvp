'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingCart, Save, Calendar, History, Settings, LogOut, Menu, Moon, Sun, Plus } from 'lucide-react';
import { useMaterial3Theme } from '@/lib/design-system/theme';
import { SimpleAuthService } from '@/lib/auth/simple-auth';
import { useCartStore } from '@/lib/store/enhanced-cart-store';
import { NavigationRailExpanded } from '@/lib/design-system/components';
import { Button } from '@/lib/design-system/components';
import CartDrawer from '@/components/cart/CartDrawer';

const NAVIGATION_ITEMS = [
  { key: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: <Home className="w-6 h-6" /> },
  { key: 'new-order', href: '/new-order', label: 'New Order', icon: <ShoppingCart className="w-6 h-6" /> },
  { key: 'saved-templates', href: '/saved-templates', label: 'Templates', icon: <Save className="w-6 h-6" /> },
  { key: 'calendar', href: '/calendar', label: 'Calendar', icon: <Calendar className="w-6 h-6" /> },
  { key: 'order-history', href: '/order-history', label: 'History', icon: <History className="w-6 h-6" /> },
  { key: 'settings', href: '/settings', label: 'Settings', icon: <Settings className="w-6 h-6" /> }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { colorScheme, setThemeMode, themeMode } = useMaterial3Theme();
  
  const toggleTheme = () => {
    const nextMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    setThemeMode(nextMode);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isOpen: cartOpen, closeCart, openCart, itemCount } = useCartStore();

  const handleLogout = async () => {
    await SimpleAuthService.signOut();
    router.push('/login');
  };

  const getActiveKey = () => {
    return NAVIGATION_ITEMS.find(item => pathname === item.href)?.key;
  };

  // Mobile overlay
  const MobileOverlay = () => (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-[var(--md-sys-color-scrim)]/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
    </>
  );

  // Mobile header
  const MobileHeader = () => (
    <header className="lg:hidden bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)] p-4">
      <div className="flex items-center justify-between">
        <Button
          variant="text"
          size="medium"
          onClick={() => setSidebarOpen(true)}
          leftIcon={<Menu className="w-6 h-6" />}
          className="p-2"
        />
        <Image 
          src={colorScheme === 'light' ? "/athletic-labs-logo.png" : "/athletic-labs-logo-white.png"}
          alt="Athletic Labs" 
          width={150} 
          height={40}
          className="h-8 w-auto"
        />
        <Button
          variant="text"
          size="medium"
          onClick={openCart}
          className="relative p-2"
          leftIcon={<ShoppingCart className="w-6 h-6" />}
        >
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--md-saas-color-error)] text-[var(--md-saas-color-on-error)] text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );

  // Desktop Navigation Rail
  const DesktopNavigation = () => (
    <div className="hidden lg:block">
      <NavigationRailExpanded
        items={NAVIGATION_ITEMS.map(item => ({
          ...item,
          badge: item.key === 'new-order' && itemCount > 0 ? itemCount : undefined
        }))}
        activeKey={getActiveKey()}
        width={280}
        header={
          <div className="flex justify-center">
            <Image 
              src={colorScheme === 'light' ? "/athletic-labs-logo.png" : "/athletic-labs-logo-white.png"}
              alt="Athletic Labs" 
              width={160} 
              height={44}
              className="h-10 w-auto"
            />
          </div>
        }
        fabAction={{
          icon: <Plus className="w-6 h-6" />,
          label: 'New Order',
          onClick: () => router.push('/new-order')
        }}
        footer={
          <div className="space-y-2">
            <Button
              variant="text"
              fullWidth
              leftIcon={<ShoppingCart className="w-5 h-5" />}
              rightIcon={itemCount > 0 ? (
                <div className="bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs rounded-full px-2 py-0.5 font-medium min-w-[20px] text-center">
                  {itemCount}
                </div>
              ) : undefined}
              onClick={openCart}
              className="justify-start"
            >
              Cart
            </Button>
            
            <Button
              variant="text"
              fullWidth
              leftIcon={colorScheme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              onClick={toggleTheme}
              className="justify-start"
            >
              {colorScheme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Button>
            
            <Button
              variant="text"
              fullWidth
              leftIcon={<LogOut className="w-5 h-5" />}
              onClick={handleLogout}
              className="justify-start"
            >
              Logout
            </Button>
          </div>
        }
      />
    </div>
  );

  // Mobile Navigation Rail
  const MobileNavigation = () => (
    <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <NavigationRailExpanded
        items={NAVIGATION_ITEMS.map(item => ({
          ...item,
          badge: item.key === 'new-order' && itemCount > 0 ? itemCount : undefined
        }))}
        activeKey={getActiveKey()}
        width={280}
        header={
          <div className="flex items-center justify-between">
            <Image 
              src={colorScheme === 'light' ? "/athletic-labs-logo.png" : "/athletic-labs-logo-white.png"}
              alt="Athletic Labs" 
              width={160} 
              height={44}
              className="h-10 w-auto"
            />
            <Button
              variant="text"
              size="small"
              onClick={() => setSidebarOpen(false)}
              className="p-1 lg:hidden"
            >
              ×
            </Button>
          </div>
        }
        fabAction={{
          icon: <Plus className="w-6 h-6" />,
          label: 'New Order',
          onClick: () => {
            router.push('/new-order');
            setSidebarOpen(false);
          }
        }}
        footer={
          <div className="space-y-2">
            <Button
              variant="text"
              fullWidth
              leftIcon={<ShoppingCart className="w-5 h-5" />}
              rightIcon={itemCount > 0 ? (
                <div className="bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs rounded-full px-2 py-0.5 font-medium min-w-[20px] text-center">
                  {itemCount}
                </div>
              ) : undefined}
              onClick={() => {
                openCart();
                setSidebarOpen(false);
              }}
              className="justify-start"
            >
              Cart
            </Button>
            
            <Button
              variant="text"
              fullWidth
              leftIcon={colorScheme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              onClick={toggleTheme}
              className="justify-start"
            >
              {colorScheme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Button>
            
            <Button
              variant="text"
              fullWidth
              leftIcon={<LogOut className="w-5 h-5" />}
              onClick={() => {
                handleLogout();
                setSidebarOpen(false);
              }}
              className="justify-start"
            >
              Logout
            </Button>
          </div>
        }
        onItemClick={() => setSidebarOpen(false)}
      />
    </div>
  );

  return (
    <div className="flex h-screen bg-[var(--md-sys-color-surface)]">
      <MobileOverlay />
      <DesktopNavigation />
      <MobileNavigation />

      <div className="flex-1 flex flex-col">
        <MobileHeader />
        
        <main className="flex-1 overflow-y-auto bg-[var(--md-sys-color-surface-container-lowest)]">
          <div className="p-6">{children}</div>
        </main>
      </div>
      
      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={closeCart} />
    </div>
  );
}