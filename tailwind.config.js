/** @type {import('tailwindcss').Config} */

// Colors are CSS variables (space-separated RGB channels, declared in src/index.css)
// so every surface, text and accent color comes from one place and opacity
// modifiers like `bg-accent/10` keep working.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Segoe UI Variable Text"', '"Segoe UI"', 'system-ui', '-apple-system',
          'BlinkMacSystemFont', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif',
        ],
        mono: [
          'ui-monospace', '"SF Mono"', '"Cascadia Mono"', 'Consolas', '"Liberation Mono"', 'monospace',
        ],
      },
      colors: {
        canvas: token('canvas'),       // page background
        surface: token('surface'),     // cards / panels
        raised: token('raised'),       // buttons, hovered rows, nested blocks
        line: token('line'),           // default borders
        'line-strong': token('line-strong'),
        ink: token('ink'),             // primary text
        'ink-2': token('ink-2'),       // secondary text
        'ink-3': token('ink-3'),       // hints, placeholders
        accent: token('accent'),       // the one brand color
        'accent-ink': token('accent-ink'), // text drawn on top of accent
        good: token('good'),
        warn: token('warn'),
        bad: token('bad'),
        // Grades run on one ordered scale (green -> amber -> red) instead of a rainbow.
        'grade-s': token('grade-s'),
        'grade-a': token('grade-a'),
        'grade-b': token('grade-b'),
        'grade-c': token('grade-c'),
        'grade-d': token('grade-d'),
        'grade-e': token('grade-e'),
        'grade-f': token('grade-f'),
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
