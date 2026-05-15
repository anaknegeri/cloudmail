import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-2': 'var(--bg-2)',
        surface: 'var(--surface)',
        's2': 'var(--surface-2)',
        's3': 'var(--surface-3)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        'ink-4': 'var(--ink-4)',
        line: 'var(--line)',
        'line-2': 'var(--line-2)',
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
        'accent-soft': 'var(--accent-soft)',
        'accent-soft-2': 'var(--accent-soft-2)',
        peach: 'var(--peach)',
        'peach-soft': 'var(--peach-soft)',
        sage: 'var(--sage)',
        'sage-soft': 'var(--sage-soft)',
        lavender: 'var(--lavender)',
        'lavender-soft': 'var(--lavender-soft)',
        rose: 'var(--rose)',
        'rose-soft': 'var(--rose-soft)',
        sunshine: 'var(--sunshine)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '10px',
        DEFAULT: '16px',
        lg: '22px',
        xl: '28px',
      },
      boxShadow: {
        '1': 'var(--shadow-1)',
        '2': 'var(--shadow-2)',
        '3': 'var(--shadow-3)',
        'pop': 'var(--shadow-pop)',
      },
    },
  },
  plugins: [],
} satisfies Config
