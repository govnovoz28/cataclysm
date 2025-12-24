import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
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
        border: "var(--border)",
        muted: "var(--muted)",
      },
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


            p: {
              marginTop: '0.5em', 
              marginBottom: '0.5em',
              lineHeight: '1.6',
            },

            'h1, h2, h3, h4': {
              marginTop: '1.2em',
              marginBottom: '0.6em',
            },
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

