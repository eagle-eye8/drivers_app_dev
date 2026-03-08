import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ToastProvider } from "@/components/toast/ToastProvider";
import { SnackbarProvider } from "@/components/ui/SnackbarProvider";
import { AuthProvider } from "./providers/AuthProvider";

export const metadata: Metadata = {
  title: "My Logistics App",
  description: "Efficient delivery management",
  icons: {
    icon: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "800"], // ロゴに使う太さを指定
  variable: "--font-outfit",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={outfit.variable}>
      <body className="font-sans">
        <AuthProvider>
          <Header />
          <ToastProvider>
            <SnackbarProvider>{children}</SnackbarProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
