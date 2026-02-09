import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Toaster } from 'sonner';
import { TransactionProvider } from "@/contexts/transaction-context";
import { TransactionLogger } from "@/components/transaction-logger";
import { BottomNav } from "@/components/bottom-nav";
import { GlobalStatus } from "@/components/global-status";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CryptoPet | Web3 Learning Game",
  description: "Learn DeFi while caring for your digital pet on Stellar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Outfit:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body
        className="min-h-screen font-sans selection:bg-yellow-400 selection:text-blue-900 overscroll-none"
        style={{
          backgroundColor: '#1a2c42', // Fallback
          background: 'linear-gradient(180deg, #1c2e4a 0%, #0d1b2a 100%)',
          color: '#f0f4f8'
        }}
      >
        <TransactionProvider>

          <main className="container mx-auto px-4 py-8 relative z-10 pb-24">
            <GlobalStatus />
            {children}
          </main>
          <TransactionLogger />
          <BottomNav />
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                borderRadius: '12px',
                border: '2px solid #5d7599',
                background: '#1c2e4a',
                fontFamily: '"Outfit", sans-serif',
                color: '#fff',
                boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
              }
            }}
          />
        </TransactionProvider>
      </body>
    </html>
  );
}
