import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-inter", display: "swap" });
const plusJakarta = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: "Avia Wellness | Modern Clinic Management Software",
  description: "Comprehensive clinic management software with EMR, appointment scheduling, digital prescriptions, WhatsApp integration, billing, and more. Streamline your healthcare practice today.",
  keywords: "clinic management software, EMR, electronic medical records, appointment scheduling, digital prescription, healthcare software, patient management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${plusJakarta.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#172321',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#74AA60',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
