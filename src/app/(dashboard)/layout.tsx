'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Home, ShoppingCart, Save, Calendar, History, Settings, LogOut, Menu, Moon, Sun, Plus } from 'lucide-react';
import { useMaterial3Theme } from '@/lib/design-system/theme';
import { SimpleAuthService } from '@/lib/auth/simple-auth';
import { useCartStore } from '@/lib/store/cart-store';
import { NavigationResponsive } from '@/lib/design-system/components/NavigationResponsive';
import { ScreenReaderOnly, IconButton, Button, Badge } from '@/lib/design-system/components';
import { useNavigationState } from '@/lib/hooks/useNavigationState';
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
  const router = useRouter();
  const { colorScheme, setThemeMode, themeMode } = useMaterial3Theme();
  const { isOpen: cartOpen, closeCart, openCart, itemCount } = useCartStore();
  const {
    getActiveNavigationKey,
    handleNavigationClick,
    shouldShowBottomNav,
    getContentSpacing,
    navigationPattern
  } = useNavigationState({
    autoCloseMobile: true,
    persistDrawerState: false
  });
  
  const toggleTheme = () => {
    const nextMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    setThemeMode(nextMode);
  };

  const handleLogout = async () => {
    await SimpleAuthService.signOut();
    router.push('/login');
  };

  // Enhanced navigation items with cart badge
  const navigationItems = NAVIGATION_ITEMS.map(item => ({
    ...item,
    badge: item.key === 'new-order' && itemCount > 0 ? itemCount : undefined
  }));

  // Mobile header for compact width
  const CompactHeader = () => shouldShowBottomNav ? (
    <header className="bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)] px-4 py-3">
      <div className="flex items-center justify-between max-w-screen-sm mx-auto">
        <Image 
          src={colorScheme === 'light' ? "/athletic-labs-logo.png" : "/athletic-labs-logo-white.png"}
          alt="Athletic Labs" 
          width={120} 
          height={32}
          className="h-8 w-auto"
        />
        
        <div className="flex items-center gap-2">
          <IconButton
            icon={colorScheme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            onClick={toggleTheme}
            variant="standard"
            size="small"
            aria-label={`Switch to ${colorScheme === 'light' ? 'dark' : 'light'} mode`}
          />
          
          <Badge badgeContent={itemCount} color="error" invisible={itemCount === 0}>
            <IconButton
              icon={<ShoppingCart className="w-5 h-5" />}
              onClick={openCart}
              variant="standard"
              size="small"
              aria-label={`Shopping cart ${itemCount > 0 ? `with ${itemCount} items` : '(empty)'}`}
            />
          </Badge>
        </div>
      </div>
    </header>
  ) : null;

  return (
    <div className="dashboard-layout">
      {/* Skip Links */}
      <ScreenReaderOnly as="a" href="#main-content" className="focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-2 focus:bg-[var(--md-sys-color-surface)] focus:border focus:rounded">
        Skip to main content
      </ScreenReaderOnly>
      <ScreenReaderOnly as="a" href="#navigation" className="focus:not-sr-only focus:absolute focus:top-2 focus:left-20 focus:z-50 focus:p-2 focus:bg-[var(--md-sys-color-surface)] focus:border focus:rounded">
        Skip to navigation
      </ScreenReaderOnly>
      
      {/* Main Content Area - Grid positioned */}
      <main 
        id="main-content"
        className="main-content-area"
        role="main"
        aria-label="Main content area"
      >
        {/* Mobile header when needed */}
        <CompactHeader />
        
        {/* Content with proper padding */}
        <div className={`${shouldShowBottomNav ? 'p-4' : 'p-6'} max-w-7xl mx-auto`}>
          {children}
        </div>
      </main>
      
      {/* Navigation Area - Grid positioned */}
      <div id="navigation" className="navigation-area">
        <NavigationResponsive
          items={navigationItems}
          activeKey={getActiveNavigationKey(NAVIGATION_ITEMS)}
          onItemClick={handleNavigationClick}
          header={
            <div className="flex justify-center">
              <Image 
                src={colorScheme === 'light' ? "/athletic-labs-logo.png" : "/athletic-labs-logo-white.png"}
                alt="Athletic Labs" 
                width={navigationPattern === 'expanded' ? 160 : 120} 
                height={navigationPattern === 'expanded' ? 44 : 32}
                className={navigationPattern === 'expanded' ? 'h-11 w-auto' : 'h-8 w-auto'}
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
                fullWidth={navigationPattern === 'expanded'}
                leftIcon={<ShoppingCart className="w-5 h-5" />}
                rightIcon={navigationPattern === 'expanded' && itemCount > 0 ? (
                  <div className="bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] md3-label-small rounded-full px-2 py-0.5 font-medium min-w-[20px] text-center">
                    {itemCount}
                  </div>
                ) : undefined}
                onClick={openCart}
                className={navigationPattern === 'expanded' ? 'justify-start' : ''}
                aria-label={`${navigationPattern === 'expanded' ? 'Cart' : `Shopping cart ${itemCount > 0 ? `with ${itemCount} items` : '(empty)'}`}`}
              >
                {navigationPattern === 'expanded' ? 'Cart' : ''}
              </Button>
              
              <Button
                variant="text"
                fullWidth={navigationPattern === 'expanded'}
                leftIcon={colorScheme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                onClick={toggleTheme}
                className={navigationPattern === 'expanded' ? 'justify-start' : ''}
                aria-label={navigationPattern === 'expanded' ? `${colorScheme === 'light' ? 'Dark' : 'Light'} Mode` : `Switch to ${colorScheme === 'light' ? 'dark' : 'light'} mode`}
              >
                {navigationPattern === 'expanded' ? `${colorScheme === 'light' ? 'Dark' : 'Light'} Mode` : ''}
              </Button>
              
              <Button
                variant="text"
                fullWidth={navigationPattern === 'expanded'}
                leftIcon={<LogOut className="w-5 h-5" />}
                onClick={handleLogout}
                className={navigationPattern === 'expanded' ? 'justify-start' : ''}
                aria-label={navigationPattern === 'expanded' ? 'Logout' : 'Sign out'}
              >
                {navigationPattern === 'expanded' ? 'Logout' : ''}
              </Button>
            </div>
          }
        />
      </div>
      
      {/* Cart Drawer - Remains fixed positioned for overlay */}
      <CartDrawer open={cartOpen} onClose={closeCart} />
    </div>
  );
}