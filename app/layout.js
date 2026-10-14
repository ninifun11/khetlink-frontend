import './globals.css';
import { Public_Sans, Sora } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import ConfigBanner from '@/components/ConfigBanner';
import { LanguageProvider } from '@/lib/i18n';

const display = Sora({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = Public_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata = {
  title: { default: 'KhetLink — farm-fresh produce, straight from the farmer', template: '%s · KhetLink' },
  description:
    'A direct marketplace for farmers and FPOs to sell to households and bulk buyers, with pooled logistics and AI-assisted pricing, demand forecasts and route planning.',
  icons: { icon: '/favicon.svg' },
};

export const viewport = { themeColor: '#2A3B7D' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">
        <a href="#main" className="sr-only rounded-md bg-neel-700 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50">Skip to content</a>
        <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <ConfigBanner />
            <Navbar />
            <main id="main">{children}</main>
          </CartProvider>
        </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
