"use client";

/**
 * ThemeProvider: aplica o tema salvo no localStorage antes do primeiro render.
 * O script inline garante que não há flash de tema errado (FOUC).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Script executado antes de qualquer render para aplicar tema */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              const saved = localStorage.getItem('theme');
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (saved === 'dark' || (!saved && prefersDark)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          `,
        }}
      />
      {children}
    </>
  );
}
