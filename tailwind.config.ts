import type { Config } from 'tailwindcss'

import colors from 'tailwindcss/colors'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],

  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Inter', 'Helvetica', 'Arial'],
    },
    extend: {
      spacing: {
        0.25: '0.0625rem',
        0.75: '0.1875rem',
        '2px': '2px',
        1.2: '0.3rem',
        1.4: '0.35rem',
        2.5: '0.625rem',
        4.5: '1.125rem',
        5.5: '1.375rem',
        6.5: '1.625rem',
        7.5: '1.875rem',
        8.5: '2.125rem',
        9: '2.25rem',
        9.5: '2.375rem',
        15: '3.75rem',
        18: '4.5rem',
        100: '25rem',
        120: '30rem',
        128: '32rem',
        256: '64rem',
        '3/10': '30%',
        '4/10': '40%',
        '9/10': '90%',
      },
      screens: {
        '2lg': '1152px',
        '2xl': '1440px',
        '3xl': '1600px',
        '4xl': '1800px',
        '5xl': '1920px',
        '6xl': '2048px',
      },
      scale: {
        101: '1.01',
        102: '1.02',
        104: '1.04',
      },
      lineHeight: {
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
      },
      colors: {
        gray: colors.gray,
        //theme: colors.blue,
        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          light: 'rgb(var(--color-border-light) / <alpha-value>)',
          dark: 'rgb(var(--color-border-dark) / <alpha-value>)',
        },
        input: 'rgb(var(--color-input) / <alpha-value>)',
        ring: 'rgb(var(--color-ring) / <alpha-value>)',
        body: 'rgb(var(--color-body) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          alt: 'rgb(var(--color-primary-alt) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-foreground) / <alpha-value>)',
        },
        theme: {
          DEFAULT: 'rgb(var(--color-theme) / <alpha-value>)',
          muted: 'rgb(var(--color-theme-muted) / <alpha-value>)',
          alt: 'rgb(var(--color-theme-alt) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          foreground: 'rgb(var(--color-secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--color-destructive) / <alpha-value>)',
          alt: 'rgb(var(--color-destructive-alt) / <alpha-value>)',
          foreground:
            'rgb(var(--color-destructive-foreground) / <alpha-value>)',
        },
        shortcuts: {
          DEFAULT: 'rgb(var(--color-shortcuts) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--color-muted) / <alpha-value>)',
          foreground: 'rgb(var(--color-muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          dark: 'rgb(var(--color-accent-dark) / <alpha-value>)',
          foreground: 'rgb(var(--color-accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--color-popover) / <alpha-value>)',
          foreground: 'rgb(var(--color-popover-foreground) / <alpha-value>)',
          alt: 'rgb(var(--color-popover-alt) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--color-card) / <alpha-value>)',
          foreground: 'rgb(var(--color-card-foreground) / <alpha-value>)',
        },
        overlay: {
          DEFAULT: 'rgb(var(--color-overlay) / <alpha-value>)',
        },
      },
      boxShadow: {
        box: '0 0 8px 2px rgba(0, 0, 0, 0.1)',
        box2: '0 0 8px 4px rgba(0, 0, 0, 0.25)',
        header: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
        '4xl':
          'rgba(0, 0, 0, 0.3) 0px 0px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px',
        glass:
          'inset 0 0 0 3000px rgba(150, 150, 150, 0.2), rgba(0, 0, 0, 0.3) 0px 0px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px',
        'dark-glass':
          'inset 0 0 0 3000px rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3) 0px 0px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px',
      },
      borderWidth: {
        3: '3px',
      },
      borderRadius: {
        theme: 'var(--radius-theme)',
        menu: 'var(--radius-menu)',
      },
      inset: {
        0.75: '0.1875rem',
      },
      padding: {
        0.75: '0.1875rem',
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
        110: '110',
        overlay: '200',
        modal: '300',
        alert: '400',
      },
      gridTemplateColumns: {
        // Simple 20 column grid
        16: 'repeat(16, minmax(0, 1fr))',
        20: 'repeat(20, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-13': 'span 13 / span 13',
        'span-14': 'span 14 / span 14',
        'span-15': 'span 15 / span 15',
        'span-18': 'span 18 / span 18',
      },
      strokeWidth: {
        2: '2px',
        3: '3px',
        4: '4px',
      },
      fontSize: {
        xxs: '0.6rem',
      },
      transitionProperty: {
        filter: 'filter',
        placeholder: 'opacity, filter, transform',
      },
      margin: {
        18: '4.5rem',
      },
      opacity: {
        1: '.01',
        2: '.02',
        98: '.98',
      },
      grayscale: {
        50: '50%',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.83, 0, 0.17, 1)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('tailwind-scrollbar-hide')],
} satisfies Config
