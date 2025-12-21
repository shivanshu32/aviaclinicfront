import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

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
        className={`${inter.variable} ${plusJakarta.variable} ${poppins.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
