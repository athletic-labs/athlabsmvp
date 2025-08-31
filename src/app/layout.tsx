import './globals.css';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { ErrorBoundary } from '@/lib/error/error-boundary';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Athletic Labs',
  description: 'Premium meal catering for professional sports teams',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <ThemeProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'white',
                  color: '#1a2332',
                  border: '1px solid #e5e7eb',
                },
                className: 'dark:bg-navy dark:text-white dark:border-smoke/30',
              }}
            />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}