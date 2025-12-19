import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Основная папка
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Компоненты
    // Папку ./pages можно убрать, если у тебя используется App Router (папка app)
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        serif: ["var(--font-serif)", "serif"],
        orbitron: ["var(--font-orbitron)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)", // Убедись, что переменная --border есть в globals.css
        muted: "var(--muted)",   // Убедись, что переменная --muted есть в globals.css
      },
      // Настройки typography оставляем, они полезны для статей
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--foreground)',
            '--tw-prose-headings': 'var(--foreground)',
            '--tw-prose-lead': 'var(--muted)',
            '--tw-prose-links': 'var(--foreground)',
            '--tw-prose-bold': 'var(--foreground)',
            '--tw-prose-counters': 'var(--muted)',
            '--tw-prose-bullets': 'var(--muted)',
            '--tw-prose-hr': 'var(--border)',
            '--tw-prose-quotes': 'var(--foreground)',
            '--tw-prose-quote-borders': 'var(--border)',
            '--tw-prose-captions': 'var(--muted)',
            '--tw-prose-code': 'var(--foreground)',
            '--tw-prose-pre-code': 'var(--background)',
            '--tw-prose-pre-bg': 'var(--foreground)',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;