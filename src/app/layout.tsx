import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: 'InvTrack | Smart Inventory Audit Management',
  description: 'Enterprise inventory audit lifecycle management and operational analytics.',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body text-[#16202E] bg-[#F7F9FC] antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
