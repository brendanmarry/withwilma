# Wilma Design System

## 🎨 Brand Colors

### Primary Palette
```css
--brand-primary: #5851ea;        /* Main brand purple */
--brand-primary-hover: #4641d9;  /* Hover state */
--brand-primary-light: #8b84ff;  /* Light variant */
--brand-primary-dark: #3a31b8;   /* Dark variant */
```

### Semantic Colors
```css
--success: #10b981;     /* Green - positive actions */
--warning: #f59e0b;     /* Amber - warnings */
--error: #ef4444;       /* Red - errors */
--info: #3b82f6;        /* Blue - information */
```

### Neutrals
```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
--gray-950: #030712;
```

### Background & Text
```css
--background: #ffffff;
--background-secondary: #f9fafb;
--foreground: #111827;
--foreground-muted: #6b7280;
```

---

## 📐 Typography Scale

### Font Families
- **Sans-serif**: `Geist Sans` (primary)
- **Monospace**: `Geist Mono` (code, technical)

### Type Scale
| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| `display-2xl` | 4.5rem (72px) | 1.1 | 700 | Hero headlines |
| `display-xl` | 3.75rem (60px) | 1.1 | 700 | Page headers |
| `display-lg` | 3rem (48px) | 1.2 | 700 | Section headers |
| `heading-xl` | 2.25rem (36px) | 1.3 | 600 | H1 |
| `heading-lg` | 1.875rem (30px) | 1.3 | 600 | H2 |
| `heading-md` | 1.5rem (24px) | 1.4 | 600 | H3 |
| `heading-sm` | 1.25rem (20px) | 1.4 | 600 | H4 |
| `body-lg` | 1.125rem (18px) | 1.6 | 400 | Large body |
| `body-md` | 1rem (16px) | 1.6 | 400 | Default body |
| `body-sm` | 0.875rem (14px) | 1.5 | 400 | Small text |
| `body-xs` | 0.75rem (12px) | 1.4 | 400 | Captions |

### Tailwind Classes
```
text-display-2xl → text-[4.5rem] leading-tight font-bold
text-display-xl → text-6xl leading-tight font-bold
text-display-lg → text-5xl leading-tight font-bold
text-heading-xl → text-4xl font-semibold
text-heading-lg → text-3xl font-semibold
text-heading-md → text-2xl font-semibold
text-heading-sm → text-xl font-semibold
text-body-lg → text-lg
text-body-md → text-base
text-body-sm → text-sm
text-body-xs → text-xs
```

---

## 📏 Spacing Scale

Based on Tailwind's default 4px base unit:

| Token | Rem | Pixels | Usage |
|-------|-----|--------|-------|
| `0` | 0 | 0px | No spacing |
| `1` | 0.25rem | 4px | Tight spacing |
| `2` | 0.5rem | 8px | Small gaps |
| `3` | 0.75rem | 12px | Default gap |
| `4` | 1rem | 16px | Standard spacing |
| `6` | 1.5rem | 24px | Medium spacing |
| `8` | 2rem | 32px | Large spacing |
| `12` | 3rem | 48px | Section spacing |
| `16` | 4rem | 64px | Large sections |
| `24` | 6rem | 96px | Hero spacing |
| `32` | 8rem | 128px | Extra large |

---

## 🔘 Buttons

### Primary Button
```tsx
<button className="bg-[#5851ea] hover:bg-[#4641d9] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md">
  Primary Action
</button>
```

### Secondary Button
```tsx
<button className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-lg font-semibold border border-gray-300 transition-colors duration-200">
  Secondary Action
</button>
```

### Ghost Button
```tsx
<button className="bg-transparent hover:bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
  Ghost Action
</button>
```

### Sizes
- **Small**: `px-4 py-2 text-sm`
- **Medium**: `px-6 py-3 text-base` (default)
- **Large**: `px-8 py-4 text-lg`

---

## 🎴 Cards

### Basic Card
```tsx
<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
  {/* Content */}
</div>
```

### Elevated Card
```tsx
<div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
  {/* Content */}
</div>
```

### Interactive Card
```tsx
<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-[#5851ea] transition-all duration-200 cursor-pointer">
  {/* Content */}
</div>
```

---

## 📐 Layout Grid

### Container
```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
  {/* Content */}
</div>
```

### Breakpoints (Tailwind defaults)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Grid System
```tsx
{/* 12-column responsive grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Items */}
</div>
```

---

## 🌑 Shadows

```css
shadow-sm → 0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow → 0 1px 3px 0 rgb(0 0 0 / 0.1)
shadow-md → 0 4px 6px -1px rgb(0 0 0 / 0.1)
shadow-lg → 0 10px 15px -3px rgb(0 0 0 / 0.1)
shadow-xl → 0 20px 25px -5px rgb(0 0 0 / 0.1)
shadow-2xl → 0 25px 50px -12px rgb(0 0 0 / 0.25)
```

---

## 🔲 Border Radius

```css
rounded-sm → 0.125rem (2px)   /* Subtle */
rounded → 0.25rem (4px)        /* Default */
rounded-md → 0.375rem (6px)    /* Medium */
rounded-lg → 0.5rem (8px)      /* Large - cards */
rounded-xl → 0.75rem (12px)    /* Extra large - panels */
rounded-2xl → 1rem (16px)      /* 2X large - hero sections */
rounded-3xl → 1.5rem (24px)    /* 3X large - special */
rounded-full → 9999px          /* Circular */
```

**Usage Guide:**
- Buttons: `rounded-lg`
- Cards: `rounded-xl`
- Panels: `rounded-2xl`
- Avatars: `rounded-full`
- Inputs: `rounded-lg`
- Badges: `rounded-full`

---

## 🖼️ Image Style Rules

### Aspect Ratios
```tsx
{/* 16:9 - Video/Hero images */}
<div className="aspect-video">
  <Image src="..." fill className="object-cover" />
</div>

{/* 4:3 - Standard images */}
<div className="aspect-[4/3]">
  <Image src="..." fill className="object-cover" />
</div>

{/* 1:1 - Square avatars/thumbnails */}
<div className="aspect-square">
  <Image src="..." fill className="object-cover" />
</div>
```

### Image Treatment
- **Hero images**: `rounded-2xl shadow-xl`
- **Card images**: `rounded-lg`
- **Avatars**: `rounded-full`
- **Thumbnails**: `rounded-md`

### Image Loading
- Always use Next.js `<Image>` component
- Add `priority` for above-the-fold images
- Use `loading="lazy"` for below-the-fold
- Provide descriptive `alt` text
- Optimize: WebP/AVIF formats preferred

---

## ♿ Accessibility Guidelines

1. **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
2. **Focus States**: Visible focus rings on all interactive elements
3. **Semantic HTML**: Use proper heading hierarchy (h1 → h2 → h3)
4. **ARIA Labels**: Add for icon-only buttons and complex components
5. **Alt Text**: Descriptive for meaningful images, empty for decorative

---

## 🎭 Animation Guidelines

### Transitions
```css
transition-all duration-200 → Quick interactions (hover, focus)
transition-all duration-300 → Standard transitions
transition-all duration-500 → Smooth transitions (modals)
```

### Framer Motion Presets
```tsx
// Fade in
{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }

// Slide up
{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } }

// Scale in
{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3 } }
```

---

## 🚀 Component Examples

### Hero Section
```tsx
<section className="container mx-auto px-4 py-24">
  <h1 className="text-6xl font-bold text-gray-900 leading-tight">
    Meet Wilma
  </h1>
  <p className="text-xl text-gray-600 mt-6 max-w-2xl">
    Your AI-powered recruitment assistant
  </p>
  <button className="mt-8 bg-[#5851ea] hover:bg-[#4641d9] text-white px-8 py-4 rounded-lg font-semibold text-lg">
    Get Started
  </button>
</section>
```

### Feature Card
```tsx
<div className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-200">
  <div className="w-12 h-12 bg-[#5851ea] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
    <Icon className="w-6 h-6 text-[#5851ea]" />
  </div>
  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Feature Title</h3>
  <p className="text-gray-600">Feature description goes here.</p>
</div>
```

---

*Last updated: November 2025*

