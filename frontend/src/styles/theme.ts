export const theme = {
  light: {
    colors: {
      background: '#F9FAFB',   // off-white
      surface: '#FFFFFF',      // white card surface
      primary: '#3B82F6',      // calm blue
      primaryHover: '#2563EB', // darker blue
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      text: '#111827',         // dark slate
      muted: '#6B7280',        // muted gray
    },
    fontFamily:
      "'Inter', 'Roboto', system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    radii: {
      sm: '6px',
      md: '12px',
      lg: '20px',
    },
    transition: {
      fast: '0.2s ease-in-out',
    },
  },
  dark: {
    colors: {
      background: '#111827',   // dark slate gray
      surface: '#1F2937',      // darker surface
      primary: '#60A5FA',      // lighter blue
      primaryHover: '#3B82F6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      text: '#F9FAFB',         // white
      muted: '#9CA3AF',        // gray
    },
    fontFamily:
      "'Inter', 'Roboto', system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    radii: {
      sm: '6px',
      md: '12px',
      lg: '20px',
    },
    transition: {
      fast: '0.2s ease-in-out',
    },
  },
} as const;

export type Theme = typeof theme;
export default theme;
