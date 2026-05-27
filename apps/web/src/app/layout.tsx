import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard Industrial — Misturador",
  description: "Monitoramento em tempo real do misturador industrial",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        {/*
          ThemeProvider injeta a classe "dark" no <html> baseado no localStorage.
          suppressHydrationWarning evita erro de mismatch SSR/CSR no Next.js.
        */}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
