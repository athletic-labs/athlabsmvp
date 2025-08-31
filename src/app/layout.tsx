import './globals.css';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { ErrorBoundary } from '@/lib/error/error-boundary';

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
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}