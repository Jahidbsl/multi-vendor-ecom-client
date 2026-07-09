import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  // ১. Title Configuration
  title: {
    default: `${process.env.NEXT_PUBLIC_APP_NAME || "Your Brand"} - Multi-Vendor E-Commerce Platform`,
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME || "Your Brand"}`,
  },

  // ২. Meta Description & Keywords
  description: "Discover a seamless multi-vendor shopping experience with top brands, best deals, and secure checkout. Shop trending fashion, electronics, and daily essentials.",
  keywords: [
    "e-commerce",
    "multi-vendor marketplace",
    "online shopping",
    "buy online",
    "best online deals",
    "trending products",
  ],

  // ৩. Indexing Controls (Google Search Console-এর জন্য অত্যন্ত গুরুত্বপূর্ণ)
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

  // ৪. OpenGraph Meta (Social Media Sharing)
  openGraph: {
    title: `${process.env.NEXT_PUBLIC_APP_NAME || "Your Brand"} - Best Multi-Vendor Online Marketplace`,
    description: "Shop from thousands of trusted vendors. Exclusive discounts, fast delivery, and secure payments.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com",
    siteName: process.env.NEXT_PUBLIC_APP_NAME || "Your Brand",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"}/og-image.jpg`, // Public folder-এ একটি ভালো ব্যানার রেখে দিবেন
        width: 1200,
        height: 630,
        alt: `${process.env.NEXT_PUBLIC_APP_NAME} Banner`,
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // ৫. Twitter Card Meta
  twitter: {
    card: "summary_large_image",
    title: process.env.NEXT_PUBLIC_APP_NAME || "Your Brand",
    description: "Shop quality products from top vendors at unbeatable prices.",
    images: [`${process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"}/og-image.jpg`],
  },

  // ৬. Canonical URL (Duplicate Content SEO Issue রোধ করতে)
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
