import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";



const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-dm-sans",
}); 

export const metadata: Metadata = {
  title: "AI Assistant",
  description: "AI Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
          className={`${dmSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
