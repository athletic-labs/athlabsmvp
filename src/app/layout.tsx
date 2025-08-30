import './globals.css';
import { ThemeProvider } from '@/lib/theme/theme-provider';

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
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}