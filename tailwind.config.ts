// ==========================================
// tailwind.config.ts
// ==========================================
import type { Config } from "tailwindcss";

const config: Config = {
  content:[
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono:["var(--font-mono)", "monospace"],
        serif:["var(--font-serif)", "serif"],
        orbitron:["var(--font-orbitron)", "sans-serif"],
        'chakra-petch':["var(--font-chakra-petch)", "sans-serif"],
      },
      colors: {
        'theme-bg': 'rgb(var(--theme-bg) / <alpha-value>)',
        'theme-card': 'rgb(var(--theme-card) / <alpha-value>)',
        'theme-text': 'rgb(var(--theme-text) / <alpha-value>)',
        'theme-article': 'rgb(var(--theme-article) / <alpha-value>)',
        'theme-title': 'rgb(var(--theme-title) / <alpha-value>)',
        black: 'rgb(var(--color-black) / <alpha-value>)',
        white: 'rgb(var(--color-white) / <alpha-value>)',
        neutral: {
          100: 'rgb(var(--color-neutral-100) / <alpha-value>)',
          200: 'rgb(var(--color-neutral-200) / <alpha-value>)',
          300: 'rgb(var(--color-neutral-300) / <alpha-value>)',
          400: 'rgb(var(--color-neutral-400) / <alpha-value>)',
          500: 'rgb(var(--color-neutral-500) / <alpha-value>)',
          600: 'rgb(var(--color-neutral-600) / <alpha-value>)',
          700: 'rgb(var(--color-neutral-700) / <alpha-value>)',
          800: 'rgb(var(--color-neutral-800) / <alpha-value>)',
          900: 'rgb(var(--color-neutral-900) / <alpha-value>)',
          950: 'rgb(var(--color-neutral-950) / <alpha-value>)',
        }
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'rgb(var(--theme-article))',
            '--tw-prose-headings': 'rgb(var(--color-white))',
            '--tw-prose-lead': 'rgb(var(--color-neutral-500))',
            '--tw-prose-links': 'rgb(var(--theme-text))',
            '--tw-prose-bold': 'rgb(var(--theme-text))',
            '--tw-prose-counters': 'rgb(var(--color-neutral-500))',
            '--tw-prose-bullets': 'rgb(var(--color-neutral-500))',
            '--tw-prose-hr': 'rgb(var(--color-neutral-900))',
            '--tw-prose-quotes': 'rgb(var(--theme-text))',
            '--tw-prose-quote-borders': 'rgb(var(--color-neutral-900))',
            '--tw-prose-captions': 'rgb(var(--color-neutral-500))',
            '--tw-prose-code': 'rgb(var(--theme-text))',
            '--tw-prose-pre-code': 'rgb(var(--theme-bg))',
            '--tw-prose-pre-bg': 'rgb(var(--theme-text))',
            'blockquote p:first-of-type::before': {
              content: 'none',
            },
            'blockquote p:last-of-type::after': {
              content: 'none',
            },
            p: {
              marginTop: '0',
              marginBottom: '0',
              lineHeight: '1.6',
            },
            'h1, h2, h3, h4': {
              marginTop: '1.2em',
              marginBottom: '0.6em',
              color: 'rgb(var(--color-white))',
            },
            strong: {
              color: 'rgb(var(--theme-text))',
            },
          },
        },
      },
    },
  },
  plugins:[
    require('@tailwindcss/typography'),
  ],
};
export default config;