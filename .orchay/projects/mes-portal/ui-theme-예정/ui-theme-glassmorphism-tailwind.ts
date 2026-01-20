/**
 * Glassmorphism Big Sur Theme - TailwindCSS 4.x Extension
 * Source: https://dribbble.com/shots/14831798-Glassmorphism-Big-Sur-Creative-Cloud-App-Redesign
 *
 * tailwind.config.ts에 머지하여 사용합니다.
 * TRD 가이드라인: TailwindCSS는 레이아웃 보조용으로만 사용
 */

import type { Config } from 'tailwindcss';

// ============================================================================
// TailwindCSS Theme Extension
// ============================================================================

export const glassmorphismTailwindExtend = {
  colors: {
    // Primary (Deep Purple)
    primary: {
      50: '#EDE7F6',
      100: '#D1C4E9',
      200: '#B39DDB',
      300: '#9575CD',
      400: '#7E57C2',
      500: '#673AB7',
      600: '#5E35B1',
      700: '#512DA8',
      800: '#4527A0',
      900: '#311B92',
    },

    // Secondary (Pink/Magenta)
    secondary: {
      50: '#FCE4EC',
      100: '#F8BBD9',
      200: '#F48FB1',
      300: '#F06292',
      400: '#EC407A',
      500: '#E91E63',
      600: '#D81B60',
      700: '#C2185B',
      800: '#AD1457',
      900: '#880E4F',
    },

    // Accent
    accent: {
      orange: '#FF9800',
      blue: '#2196F3',
      cyan: '#00BCD4',
    },

    // Semantic
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    // Glass surfaces
    glass: {
      light: 'rgba(255, 255, 255, 0.15)',
      medium: 'rgba(255, 255, 255, 0.10)',
      dark: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.2)',
    },

    // Background
    background: {
      dark: '#1A0B2E',
      purple: '#2D1B4E',
      magenta: '#4A1942',
    },
  },

  fontFamily: {
    sans: [
      'SF Pro Display',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
    mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'monospace'],
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },

  borderRadius: {
    none: '0',
    sm: '4px',
    DEFAULT: '8px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px',
  },

  boxShadow: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.15)',
    DEFAULT: '0 4px 16px rgba(0, 0, 0, 0.2)',
    md: '0 4px 16px rgba(0, 0, 0, 0.2)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.25)',
    xl: '0 12px 48px rgba(0, 0, 0, 0.3)',
    'glow-primary': '0 0 20px rgba(103, 58, 183, 0.4)',
    'glow-accent': '0 0 20px rgba(255, 152, 0, 0.4)',
    'glow-blue': '0 0 20px rgba(33, 150, 243, 0.4)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
  },

  backdropBlur: {
    xs: '4px',
    sm: '8px',
    DEFAULT: '12px',
    md: '12px',
    lg: '20px',
    xl: '30px',
  },

  animation: {
    'fade-in': 'fadeIn 0.25s ease-out',
    'slide-up': 'slideUp 0.25s ease-out',
    'slide-down': 'slideDown 0.25s ease-out',
    'scale-in': 'scaleIn 0.2s ease-out',
    glow: 'glow 2s ease-in-out infinite alternate',
  },

  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    slideUp: {
      '0%': { opacity: '0', transform: 'translateY(10px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    slideDown: {
      '0%': { opacity: '0', transform: 'translateY(-10px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    scaleIn: {
      '0%': { opacity: '0', transform: 'scale(0.95)' },
      '100%': { opacity: '1', transform: 'scale(1)' },
    },
    glow: {
      '0%': { boxShadow: '0 0 20px rgba(103, 58, 183, 0.2)' },
      '100%': { boxShadow: '0 0 30px rgba(103, 58, 183, 0.4)' },
    },
  },

  backgroundImage: {
    'glassmorphism-gradient': 'linear-gradient(135deg, #2D1B4E 0%, #4A1942 50%, #1A0B2E 100%)',
    'primary-gradient': 'linear-gradient(135deg, #673AB7 0%, #512DA8 100%)',
    'accent-gradient': 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    'orange-gradient': 'linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)',
  },
};

// ============================================================================
// CSS Variables for globals.css
// ============================================================================

export const glassmorphismCssVariables = `
:root {
  /* Glassmorphism Theme Colors */
  --color-primary: #673AB7;
  --color-primary-light: #9575CD;
  --color-primary-dark: #512DA8;
  --color-secondary: #E91E63;
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-error: #F44336;
  --color-info: #2196F3;

  /* Glass Surface Colors */
  --glass-light: rgba(255, 255, 255, 0.15);
  --glass-medium: rgba(255, 255, 255, 0.10);
  --glass-dark: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-border-light: rgba(255, 255, 255, 0.1);

  /* Background */
  --bg-dark: #1A0B2E;
  --bg-gradient: linear-gradient(135deg, #2D1B4E 0%, #4A1942 50%, #1A0B2E 100%);

  /* Text Colors */
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-disabled: rgba(255, 255, 255, 0.4);
  --text-hint: rgba(255, 255, 255, 0.5);

  /* Blur Values */
  --blur-sm: 8px;
  --blur-md: 12px;
  --blur-lg: 20px;
  --blur-xl: 30px;

  /* Layout (TRD 기준) */
  --header-height: 64px;
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 80px;
  --footer-height: 30px;
  --tab-bar-height: 40px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.25);
  --shadow-glow: 0 0 20px rgba(103, 58, 183, 0.4);
}

/* Dark mode is the default for Glassmorphism theme */
[data-theme="glassmorphism"] {
  background: var(--bg-gradient);
  color: var(--text-primary);
  min-height: 100vh;
}
`;

// ============================================================================
// Custom Tailwind Plugin for Glassmorphism Utilities
// ============================================================================

export const glassmorphismPlugin = {
  // 커스텀 유틸리티 클래스들
  utilities: {
    // Glass Card
    '.glass-card': {
      background: 'rgba(255, 255, 255, 0.12)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
    },

    // Glass Sidebar
    '.glass-sidebar': {
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    },

    // Glass Modal
    '.glass-modal': {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
    },

    // Glass Button
    '.glass-button': {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '8px',
      color: '#FFFFFF',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
      },
    },

    // Glass Input
    '.glass-input': {
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '8px',
      color: '#FFFFFF',
      '&::placeholder': {
        color: 'rgba(255, 255, 255, 0.4)',
      },
      '&:focus': {
        borderColor: 'rgba(255, 255, 255, 0.4)',
        outline: 'none',
        boxShadow: '0 0 0 2px rgba(103, 58, 183, 0.3)',
      },
    },

    // Glass Header
    '.glass-header': {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },

    // Glass Panel
    '.glass-panel': {
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '12px',
    },

    // Text utilities
    '.text-glass-primary': {
      color: '#FFFFFF',
    },
    '.text-glass-secondary': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    '.text-glass-muted': {
      color: 'rgba(255, 255, 255, 0.5)',
    },

    // Background gradient
    '.bg-glassmorphism': {
      background: 'linear-gradient(135deg, #2D1B4E 0%, #4A1942 50%, #1A0B2E 100%)',
    },
  },
};

// ============================================================================
// TailwindCSS Config Partial (merge with existing config)
// ============================================================================

export const glassmorphismTailwindConfig: Partial<Config> = {
  theme: {
    extend: glassmorphismTailwindExtend,
  },
};

export default glassmorphismTailwindConfig;
