import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Toaster } from 'sonner';
import { TransactionProvider } from "@/contexts/transaction-context";
import { TransactionLogger } from "@/components/transaction-logger";

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
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet" />
      </head>
      <body
        className="min-h-screen bg-black text-green-400 font-mono selection:bg-green-500 selection:text-black overscroll-none"
        style={{ backgroundColor: '#000000', color: '#4ade80' }}
      >
        <TransactionProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8 relative">
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.25)50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] pointer-events-none" />
            {children}
          </main>
          <TransactionLogger />
          <Toaster
            theme="dark"
            toastOptions={{
              style: { borderRadius: '0px', border: '2px solid #39ff14', background: '#000', fontFamily: '"VT323", monospace', textTransform: 'uppercase' }
            }}
          />
        </TransactionProvider>
      </body>
    </html>
  );
}
