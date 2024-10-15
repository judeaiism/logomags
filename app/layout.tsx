import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "LogoMagic",
  description: "Add Logo and Brand To Anything",
  metadataBase: new URL('https://logomagic.vercel.app'),
  openGraph: {
    title: "LogoMagic",
    description: "Add Logo and Brand To Anything",
    url: "https://logomagic.vercel.app",
    siteName: "LogoMagic",
    images: [
      {
        url: "/logomagic.png",
        width: 1200,
        height: 630,
        alt: "LogoMagic Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LogoMagic",
    description: "Add Logo and Brand To Anything",
    creator: "@eneffti",
    images: ["/logomagic.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
