# Dashboard Style Guide

This document outlines the design system for the Digital Assessment Dashboard.

## Color Palette

Defined in `tailwind.config.js`:

```javascript
colors: {
  primary: '#1565c0',     // Blue - main brand color
  secondary: '#7b1fa2',   // Purple - secondary brand color
  success: '#28a745',     // Green - success states
  warning: '#ffc107',     // Yellow - warnings
  error: '#dc3545',       // Red - errors
}
```

## Typography

- **Headings**: `font-heading` (Inter Tight)
- **Body**: `font-sans` (Inter)
- **Code**: `font-mono` (Fira Code)

## Component Patterns

### Cards

Use simple white cards with subtle shadows:

```tsx
<div className="bg-white p-4 rounded-lg shadow">
  <p className="text-sm text-gray-600">Label</p>
  <p className="text-2xl font-bold text-gray-900">Value</p>
</div>
```

### Stats Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {/* Stat cards */}
</div>
```

### Sector/Category Cards

Use colored top border for visual distinction:

```tsx
<div
  className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
  style={{ borderTop: `4px solid #1565c0` }}
>
  {/* Card content */}
</div>
```

### Progress Bars

```tsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div
    className="bg-primary h-2 rounded-full transition-all"
    style={{ width: `${percentage}%` }}
  ></div>
</div>
```

### Links

```tsx
<Link to="/path" className="text-primary hover:underline">
  Link Text
</Link>
```

### Buttons

```tsx
<button className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700 transition-colors">
  Button Text
</button>
```

## Spacing

- Use `space-y-6` for vertical spacing between sections
- Use `gap-4` for grid gaps
- Use `p-4` or `p-6` for card padding

## Avoid

❌ **Don't use:**
- Complex gradient backgrounds on main content cards
- Multiple bright colors on the same component
- Overly decorative elements
- Inconsistent spacing

✅ **Do use:**
- Clean white cards with shadows
- Consistent padding and gaps
- Subtle color accents (top borders, text colors)
- Hover states for interactive elements

## Text Hierarchy

```tsx
// Page Title
<h1 className="text-3xl font-heading font-bold text-gray-900">

// Section Title
<h2 className="text-xl font-heading font-semibold mb-4">

// Subsection Title
<h3 className="text-lg font-heading font-semibold mb-3">

// Label Text
<p className="text-sm text-gray-600">

// Value/Data Text
<p className="text-2xl font-bold text-gray-900">

// Body Text
<p className="text-sm text-gray-700">
```

## Loading & Error States

```tsx
// Loading
<div className="text-center py-8">
  <p className="text-gray-600">Loading...</p>
</div>

// Error
<div className="p-6 bg-red-50 border border-red-200 rounded-lg">
  <p className="text-red-800">Error message</p>
</div>
```

## Key Principles

1. **Consistency**: Use the same patterns across all pages
2. **Simplicity**: Favor clean, minimal designs
3. **Clarity**: Make data easy to read and understand
4. **Accessibility**: Ensure good contrast and readable text
5. **Responsiveness**: Use Tailwind's responsive classes (`md:`, `lg:`)

