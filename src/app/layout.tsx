import './globals.css';
import { Material3ThemeProvider } from '@/lib/design-system/theme';
import { GlobalLiveAnnouncer } from '@/lib/design-system/accessibility';
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
          <Material3ThemeProvider>
            <GlobalLiveAnnouncer />
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--md-sys-color-surface-container)',
                  color: 'var(--md-sys-color-on-surface)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                },
                className: 'md3-body-medium',
              }}
            />
          </Material3ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}