"use client";

import { useState, useEffect } from "react";

type Theme = "light" | "dark";

/**
 * Gerencia o tema dark/light.
 * Persiste no localStorage e aplica a classe "dark" no <html>.
 *
 * Estratégia: NUNCA derivar o tema no servidor para evitar hydration
 * mismatch. O hook só "sabe" o tema real depois de montar no cliente.
 * O fallback inicial é "light" (igual em servidor e cliente), e o
 * consumidor (Header) usa `mounted` para esconder o ícone até o tema
 * verdadeiro ser conhecido.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Roda APENAS no cliente, após o primeiro paint.
  // Lê o estado real do DOM (já aplicado pelo script anti-FOUC no <head>)
  // ou cai no localStorage / preferência do sistema como fallback.
  useEffect(() => {
    const fromDom = document.documentElement.classList.contains("dark") ? "dark" : "light";
    const saved = localStorage.getItem("theme") as Theme | null;
    const initial = saved ?? fromDom;

    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };

  return { theme, toggle, mounted };
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}