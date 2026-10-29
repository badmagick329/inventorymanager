// HeroUI's Tailwind plugin, loaded from globals.css with `@plugin`. Tailwind 4
// has no JS config file, so the custom theme lives here. `.mts` because
// Node's type stripping loads it as ESM and warns on a plain `.ts` in this
// CommonJS package. globals.css declares
// shadcn's `--color-primary` and friends in `@theme`, which win over the
// DEFAULT shades below; HeroUI still owns the numbered shades and its own
// semantic colours (content1, default, danger, ...).
import { heroui } from '@heroui/react';

export default heroui({
  themes: {
    dark: {
      colors: {
        background: '#020617',
        foreground: '#f8fafc',
        divider: 'rgba(148, 163, 184, 0.18)',
        overlay: '#000000',
        content1: {
          DEFAULT: '#0f172a',
          foreground: '#f8fafc',
        },
        content2: {
          DEFAULT: '#172033',
          foreground: '#e2e8f0',
        },
        content3: {
          DEFAULT: '#1e293b',
          foreground: '#cbd5e1',
        },
        content4: {
          DEFAULT: '#334155',
          foreground: '#94a3b8',
        },
        default: {
          50: '#0f172a',
          100: '#172033',
          200: '#1e293b',
          300: '#334155',
          400: '#475569',
          500: '#64748b',
          600: '#94a3b8',
          700: '#cbd5e1',
          800: '#e2e8f0',
          900: '#f8fafc',
          DEFAULT: '#334155',
          foreground: '#f8fafc',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
        secondary: {
          50: '#f8fafc',
          100: '#e2e8f0',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
          DEFAULT: '#475569',
          foreground: '#f8fafc',
        },
        success: {
          50: '#052e16',
          100: '#14532d',
          200: '#166534',
          300: '#15803d',
          400: '#16a34a',
          500: '#22c55e',
          600: '#4ade80',
          700: '#86efac',
          800: '#bbf7d0',
          900: '#dcfce7',
          DEFAULT: '#22c55e',
          foreground: '#052e16',
        },
        warning: {
          50: '#451a03',
          100: '#78350f',
          200: '#92400e',
          300: '#b45309',
          400: '#d97706',
          500: '#f59e0b',
          600: '#fbbf24',
          700: '#fcd34d',
          800: '#fde68a',
          900: '#fef3c7',
          DEFAULT: '#f59e0b',
          foreground: '#451a03',
        },
        danger: {
          50: '#3b1c25',
          100: '#5a2432',
          200: '#7d2b3f',
          300: '#be123c',
          400: '#e11d48',
          500: '#f43f5e',
          600: '#fb7185',
          700: '#fda4af',
          800: '#fecdd3',
          900: '#ffe4e6',
          DEFAULT: '#f43f5e',
          foreground: '#ffffff',
        },
        focus: '#60a5fa',
      },
      layout: {
        disabledOpacity: '0.3',
        radius: {
          small: '1px',
          medium: '2px',
          large: '4px',
        },
        borderWidth: {
          small: '1px',
          medium: '2px',
          large: '3px',
        },
      },
    },
  },
});
