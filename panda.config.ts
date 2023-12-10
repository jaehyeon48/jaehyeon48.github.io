import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        fonts: {
          pretendard: { value: 'var(--font-pretendard)' },
        },
      },
    },
  },

  patterns: {
    extend: {
      contentSection: {
        description: 'A container that wraps content section',
        transform(props) {
          return {
            position: 'relative',
            mx: 'auto',
            maxWidth: {
              base: 'xl',
              md: '2xl',
              lg: '3xl',
              xl: '5xl',
            },
            px: {
              base: '16px',
              lg: 0,
            },
            ...props,
          }
        },
      },
      headerTitle: {
        description: 'A style for the title of the header',
        transform(props) {
          return {
            fontSize: {
              base: '24px',
              lg: '30px',
            },
            fontWeight: 700,
            marginTop: '4px',
            ...props,
          }
        },
      },
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',
})
