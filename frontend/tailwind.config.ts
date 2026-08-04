import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1900px',
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        message: {
          user: {
            DEFAULT: 'hsl(var(--message-user))',
            foreground: 'hsl(var(--message-user-foreground))',
          },
          assistant: {
            DEFAULT: 'hsl(var(--message-assistant))',
            foreground: 'hsl(var(--message-assistant-foreground))',
          },
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
    },
  },
  darkMode: ['class', 'class'],
  plugins: [
    heroui({
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
    }),
    require('tailwindcss-animate'),
  ],
};
export default config;
