import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
			chart: {
				'1': 'hsl(var(--chart-1))',
				'2': 'hsl(var(--chart-2))',
				'3': 'hsl(var(--chart-3))',
				'4': 'hsl(var(--chart-4))',
				'5': 'hsl(var(--chart-5))'
			},
			// MathSageAI Brand Colors
			brand: {
				blue: {
					light: '#87CEEB', // Sky blue
					DEFAULT: '#4A90E2', // Primary blue
					dark: '#2C5F8D', // Dark blue
				},
				green: {
					light: '#90EE90', // Light green
					DEFAULT: '#7FFF00', // Bright green (AI color)
					dark: '#32CD32', // Medium green
				},
				teal: {
					light: '#AFEEEE', // Light teal
					DEFAULT: '#40E0D0', // Teal
					dark: '#008B8B', // Dark teal
				},
				purple: {
					light: '#DDA0DD', // Plum
					DEFAULT: '#9370DB', // Medium purple
					dark: '#663399', // Dark purple
				},
			},
		},
		backgroundImage: {
			'gradient-brand': 'linear-gradient(135deg, #87CEEB 0%, #90EE90 100%)',
			'gradient-owl': 'linear-gradient(135deg, #4A90E2 0%, #7FFF00 100%)',
			'gradient-ai': 'linear-gradient(135deg, #AFEEEE 0%, #DDA0DD 100%)', // Light teal to plum - complements user gradient
			'gradient-chat': 'linear-gradient(to bottom, rgba(135, 206, 235, 0.05) 0%, rgba(144, 238, 144, 0.05) 100%)', // Light blue to green for chat window
			'gradient-input': 'linear-gradient(to top, rgba(175, 238, 238, 0.08) 0%, rgba(221, 160, 221, 0.08) 100%)', // Light teal to plum for input area
		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
export default config

