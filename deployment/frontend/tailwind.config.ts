import { type Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    safelist: [
        'text-nowrap'
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                acumin: ['var(--font-acumin)', ...defaultTheme.fontFamily.sans],
            },
            boxShadow: {
                wri: '0px 4px 4px 0px rgba(147, 147, 147, 0.25)',
                'wri-small':
                    'box-shadow: 0px 1px 2px 0px rgba(105, 81, 255, 0.05)',
            },
            animation: {
                'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;',
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            },
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                white: '#FFFFFF',
                'wri-gold': '#F3B229',
                'wri-black': '#1A1919',
                'wri-green': '#32864B',
                'wri-gray': '#eae8e4',
                'wri-dark-green': '#2B7340',
                'wri-light-green': '#BAE1BD',
                'wri-dark-blue': '#3654A5',
                'wri-light-blue': '#B5D6E8',
                'wri-light-yellow': '#FBE8BE',
                'wri-light-gray': '#4C4C4C',
                'wri-dark-gray': '#666666',
                'wri-row-gray': '#F9F9F9',
                'wri-slate': '#EFF5F7',
                muted: {
                    DEFAULT: 'hsl(210 40% 96.1%)',
                    foreground: 'hsl(var(--muted-foreground))',
                },
            },
            screens: {
                '4xl': '2048px',
                '3xl': '1920px',
                xxl: '1440px',
            },
            maxWidth: {
                '8xl': '1350px',
                '9xl': '1440px',
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
        },
    },
    plugins: [
        require('@tailwindcss/container-queries'),
        require('tailwindcss/plugin')(function ({
            addVariant,
        }: {
            addVariant: any
        }) {
            addVariant('not-last', '&:not(:last-child)')
        }),
        require('tailwindcss-animate'),
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
} satisfies Config
