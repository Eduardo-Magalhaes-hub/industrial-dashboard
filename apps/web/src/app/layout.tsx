import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard Industrial — Misturador",
  description: "Monitoramento em tempo real do misturador industrial",
};

/**
 * Script anti-FOUC (Flash of Unstyled Content):
 * aplica a classe "dark" no <html> ANTES de qualquer render do React,
 * lendo o localStorage ou a preferência do sistema.
 *
 * Precisa rodar no <head> (não dentro do <body>) para executar durante
 * o parse do HTML, antes do CSS ser aplicado. Se ficar no <body>, o
 * usuário enxerga o tema claro por uma fração de segundo antes do React
 * corrigir — e em alguns casos a classe é sobrescrita pelo React.
 */
const themeScript = `
  try {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}