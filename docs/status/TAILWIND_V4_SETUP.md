# Tailwind CSS v4 Setup

## What Changed

Tailwind CSS v4 introduced a new architecture that requires different configuration than v3.

### Key Differences

1. **PostCSS Plugin**
   - Old (v3): `tailwindcss` 
   - New (v4): `@tailwindcss/postcss`

2. **CSS Imports**
   - Old (v3): `@tailwind base; @tailwind components; @tailwind utilities;`
   - New (v4): `@import "tailwindcss";`

3. **Configuration**
   - Still uses `tailwind.config.js`
   - Content needs to be in `content.files` array
   - Some syntax changes for v4

## Our Setup

### postcss.config.js
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### src/index.css
```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@600;700;800&family=Fira+Code&display=swap');

@layer base {
  body {
    @apply font-sans text-gray-900 bg-gray-50;
  }
}
```

### tailwind.config.js
```javascript
export default {
  content: {
    files: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
  },
  theme: {
    extend: {
      colors: {
        primary: '#1565c0',
        secondary: '#7b1fa2',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Inter Tight', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
}
```

## Packages Installed

```bash
npm install -D tailwindcss@4.1.14 @tailwindcss/postcss postcss autoprefixer
```

## Verification

The dev server should start without errors:
```bash
npm run dev
```

Expected output:
```
VITE v7.1.8  ready in XXXms
➜  Local:   http://localhost:3000/
```

## Troubleshooting

### Error: "The PostCSS plugin has moved to a separate package"

**Solution**: Install `@tailwindcss/postcss`:
```bash
npm install -D @tailwindcss/postcss
```

### CSS Not Loading

1. Check that `@import "tailwindcss";` is in your CSS
2. Verify PostCSS config uses `@tailwindcss/postcss`
3. Clear cache: `rm -rf node_modules/.vite`

### Styles Not Applied

1. Check `content.files` in `tailwind.config.js`
2. Verify file patterns match your source files
3. Restart dev server

## Migration Notes

If you need to migrate from v3 to v4:

1. Install new packages:
   ```bash
   npm install -D @tailwindcss/postcss
   ```

2. Update `postcss.config.js`:
   ```javascript
   // Change from:
   tailwindcss: {}
   // To:
   '@tailwindcss/postcss': {}
   ```

3. Update CSS imports:
   ```css
   /* Change from: */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   /* To: */
   @import "tailwindcss";
   ```

4. Update config structure if needed

## Resources

- [Tailwind CSS v4 Beta Docs](https://tailwindcss.com/docs)
- [PostCSS Plugin Migration](https://tailwindcss.com/docs/upgrade-guide)

---

*Setup completed: October 2, 2025*

