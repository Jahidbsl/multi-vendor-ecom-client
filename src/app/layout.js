import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/shered/Navbar";
import { Footer } from "@/components/shered/Footer";
import { ToastContainer } from "react-toastify";
import ChatBot from "@/components/ChatBot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

//setup for SEO and metadata

export const metadata = {
  // 1. Title Configuration
  title: {
    default: `${process.env.NEXT_PUBLIC_APP_NAME || "ShopVerse"} - Multi-Vendor E-Commerce Platform`,
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME || "ShopVerse"}`,
  },

  verification: {
    google: "4M-Xall_f3tTcfGz_i3lqiihhHBks8szXEuoFWA7eZA",
  },

  // 2. Meta Description & Keywords
  description:
    "Discover a seamless multi-vendor shopping experience with top brands, best deals, and secure checkout. Shop trending fashion, electronics, and daily essentials.",
  keywords: [
    "e-commerce",
    "multi-vendor marketplace",
    "online shopping",
    "buy online",
    "best online deals",
    "trending products",
  ],

  // 3. Indexing Controls
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 4. OpenGraph Meta (Social Media Sharing)
  openGraph: {
    title: `${process.env.NEXT_PUBLIC_APP_NAME || "ShopVerse"} - Best Multi-Vendor Online Marketplace`,
    description:
      "Shop from thousands of trusted vendors. Exclusive discounts, fast delivery, and secure payments.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://multi-vendor-ecom-server.onrender.com",
    siteName: process.env.NEXT_PUBLIC_APP_NAME || "ShopVerse",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://multi-vendor-ecom-server.onrender.com"}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${process.env.NEXT_PUBLIC_APP_NAME} Banner`,
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // 5. Twitter Card Meta
  twitter: {
    card: "summary_large_image",
    title: process.env.NEXT_PUBLIC_APP_NAME || "ShopVerse",
    description: "Shop quality products from top vendors at unbeatable prices.",
    images: [
      `${process.env.NEXT_PUBLIC_APP_URL || "https://multi-vendor-ecom-server.onrender.com"}/og-image.png`,
    ],
  },

  // 6. Canonical URL
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://multi-vendor-ecom-server.onrender.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          {children}
          <ChatBot />
          <ToastContainer position="top-right" autoClose={3000} theme="light" />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
