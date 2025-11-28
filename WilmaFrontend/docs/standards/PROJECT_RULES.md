# 🎯 Wilma Frontend - Project Rules

## AI ASSISTANT RULES FOR THIS PROJECT

These rules govern how any AI assistant (including myself) should work with this codebase going forward.

---

## 🏗️ ARCHITECTURE ENFORCEMENT

### Component Organization
```
✅ DO:
- Create components in appropriate folders
- Use PascalCase for component files
- Place UI primitives in /components/ui/
- Place feature components in /components/
- Co-locate feature-specific components

❌ DON'T:
- Create components in the root
- Mix component types in wrong folders
- Use kebab-case for component files
```

### File Structure
```
✅ DO:
- Follow the established structure
- Use @/ imports for all src/ files
- Keep pages in app/ directory
- Store utilities in lib/

❌ DON'T:
- Create new top-level folders without reason
- Use relative imports (../../)
- Put logic in page files
```

---

## 🎨 STYLING RULES

### Tailwind First
```tsx
✅ DO:
<button className="bg-[#5851ea] hover:bg-[#4641d9] px-6 py-3 rounded-lg">
  Click me
</button>

❌ DON'T:
<button style={{ backgroundColor: '#5851ea', padding: '12px 24px' }}>
  Click me
</button>
```

### Design Tokens
```tsx
✅ DO:
- Use brand colors: #5851ea, #4641d9
- Follow spacing scale: p-4, p-6, p-8
- Use defined border radius: rounded-lg, rounded-xl
- Reference design-system.md

❌ DON'T:
- Use random hex colors
- Use arbitrary spacing values
- Invent new design tokens
```

### No Inline CSS
```tsx
❌ NEVER:
<div style={{ color: 'red', padding: '20px' }}>

✅ INSTEAD:
<div className="text-red-500 p-5">
```

---

## 🧩 COMPONENT CREATION

### Before Creating a Component
1. ✅ Check if it exists in `COMPONENT_LIBRARY.md`
2. ✅ Check if a similar component exists
3. ✅ Consider if it should be reusable
4. ✅ Determine the right location

### Component Template
```tsx
// ✅ Good Component
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MyComponentProps {
  children: ReactNode;
  variant?: "default" | "primary";
  className?: string;
}

const MyComponent = ({
  children,
  variant = "default",
  className,
}: MyComponentProps) => {
  return (
    <div className={cn("base-classes", variantClasses[variant], className)}>
      {children}
    </div>
  );
};

export default MyComponent;
```

### Component Rules
- ✅ Always type props with TypeScript
- ✅ Use `cn()` for className merging
- ✅ Export as default for pages, named for utilities
- ✅ Add JSDoc comments for complex components
- ✅ Keep components small (< 200 lines)

---

## 🔄 STATE MANAGEMENT

### Client vs Server Components
```tsx
✅ SERVER COMPONENT (default):
export default function Page() {
  // No useState, useEffect, etc.
  return <div>Static content</div>;
}

✅ CLIENT COMPONENT (when needed):
"use client";
export default function InteractiveComponent() {
  const [state, setState] = useState();
  return <div>{state}</div>;
}
```

### State Rules
- ✅ Server components by default
- ✅ Client only when you need interactivity
- ✅ Use Zustand for complex global state
- ✅ Keep state close to where it's used
- ❌ Don't add "use client" unless necessary

---

## 🎭 ANIMATION GUIDELINES

### Framer Motion
```tsx
✅ DO:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4 }}
>

❌ DON'T:
- Use excessive animations
- Animate on every interaction
- Create jarring movements
```

### Transition Rules
- ✅ Use consistent durations (200ms, 300ms, 400ms)
- ✅ Prefer opacity and transform (performant)
- ✅ Add `will-change` for complex animations
- ❌ Don't animate width/height (use scale)

---

## 📱 RESPONSIVE DESIGN

### Mobile-First Approach
```tsx
✅ DO:
<div className="flex flex-col md:flex-row gap-4 md:gap-8">

❌ DON'T:
<div className="lg:flex-col flex-row"> // Desktop-first
```

### Breakpoint Strategy
- Start with mobile styles (no prefix)
- Add `md:` for tablet (768px+)
- Add `lg:` for desktop (1024px+)
- Test all breakpoints

### Container Usage
```tsx
✅ Always wrap page content:
<Container size="xl">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {items}
  </div>
</Container>
```

---

## ♿ ACCESSIBILITY REQUIREMENTS

### Semantic HTML
```tsx
✅ DO:
<nav>
  <button aria-label="Close">
    <X className="w-4 h-4" />
  </button>
</nav>

❌ DON'T:
<div className="nav">
  <div onClick={handleClick}>
    <X />
  </div>
</div>
```

### A11y Checklist
- ✅ Use semantic HTML (nav, main, section, article)
- ✅ Add alt text to images
- ✅ ARIA labels for icon-only buttons
- ✅ Keyboard navigation support
- ✅ Focus visible styles (already in globals.css)
- ✅ Proper heading hierarchy (h1 → h2 → h3)

---

## 🖼️ IMAGE HANDLING

### Next.js Image Component
```tsx
✅ ALWAYS use Next.js Image:
import Image from "next/image";

<Image
  src="/assets/images/hero.jpg"
  alt="Detailed description of image content"
  width={1920}
  height={1080}
  priority={isAboveFold}
  className="rounded-xl"
/>

❌ NEVER use <img> tag directly:
<img src="..." alt="..." />
```

### Image Rules
- ✅ Store in `/public/assets/images/`
- ✅ Use descriptive filenames (kebab-case)
- ✅ Always provide alt text
- ✅ Use `priority` for above-the-fold images
- ✅ Optimize format (WebP/AVIF preferred)
- ❌ Never commit large (>500KB) images

---

## 📦 IMPORTS & EXPORTS

### Import Order
```tsx
// 1. React & Next.js
import { useState } from "react";
import Link from "next/link";

// 2. External libraries
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

// 3. Internal components
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

// 4. Utilities & types
import { cn } from "@/lib/utils";
import type { Job } from "@/lib/types";

// 5. Styles (if any)
import "./styles.css";
```

### Import Rules
- ✅ Use `@/` path alias for all src/ imports
- ✅ Group imports by category
- ✅ Sort alphabetically within groups
- ❌ Never use relative imports (../../)

---

## 🎯 TYPESCRIPT RULES

### Type Everything
```tsx
✅ DO:
interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

const Button = ({ children, onClick, variant }: ButtonProps) => { ... }

❌ DON'T:
const Button = ({ children, onClick, variant }: any) => { ... }
```

### Type Rules
- ✅ Define interfaces for all component props
- ✅ Use `type` for unions, `interface` for objects
- ✅ Avoid `any` - use `unknown` if needed
- ✅ Export types when used in multiple files
- ✅ Use `ReactNode` for children

---

## 🚀 PERFORMANCE RULES

### Code Splitting
```tsx
✅ Lazy load heavy components:
import dynamic from "next/dynamic";

const VideoCall = dynamic(() => import("@/components/VideoCall"), {
  loading: () => <p>Loading...</p>,
});
```

### Performance Checklist
- ✅ Use Server Components by default
- ✅ Lazy load below-the-fold components
- ✅ Optimize images with Next.js Image
- ✅ Minimize client-side JavaScript
- ✅ Use React.memo for expensive renders
- ❌ Don't fetch data in useEffect (use Server Components)

---

## 📝 DOCUMENTATION REQUIREMENTS

### Component Documentation
```tsx
/**
 * FeatureCard - Displays a feature with icon, title, and description
 * 
 * @param icon - Lucide icon component
 * @param title - Feature heading
 * @param description - Feature description text
 * 
 * @example
 * <FeatureCard
 *   icon={Sparkles}
 *   title="AI-Powered"
 *   description="Intelligent screening"
 * />
 */
```

### Documentation Rules
- ✅ Add JSDoc for exported components
- ✅ Include @example for complex components
- ✅ Document non-obvious props
- ✅ Update COMPONENT_LIBRARY.md when adding reusable components
- ❌ Don't document obvious getters/setters

---

## 🔍 CODE REVIEW CHECKLIST

Before considering any code complete:

### Functionality
- ✅ Component works as expected
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ No linter warnings

### Design
- ✅ Follows design-system.md
- ✅ Uses correct colors and spacing
- ✅ Matches Figma/design (if applicable)
- ✅ Smooth animations

### Responsive
- ✅ Mobile (375px)
- ✅ Tablet (768px)
- ✅ Desktop (1280px)
- ✅ Large desktop (1920px)

### Accessibility
- ✅ Semantic HTML
- ✅ Alt text on images
- ✅ ARIA labels where needed
- ✅ Keyboard navigation works

### Performance
- ✅ No unnecessary re-renders
- ✅ Images optimized
- ✅ No large bundles
- ✅ Fast page load

### Code Quality
- ✅ TypeScript types defined
- ✅ Reusable components used
- ✅ No code duplication
- ✅ Clean, readable code
- ✅ Proper error handling

---

## 🎨 UI/UX ENHANCEMENT WORKFLOW

When the user asks: "Make it more premium" or "Add animations":

### Premium Design Checklist
- ✅ Increase whitespace (padding/margins)
- ✅ Add subtle shadows (shadow-lg, shadow-xl)
- ✅ Use backdrop blur (bg-white/80 backdrop-blur-md)
- ✅ Add gradient backgrounds (from-[#5851ea] to-[#8b84ff])
- ✅ Smoother border radius (rounded-2xl instead of rounded-lg)
- ✅ Better typography hierarchy (larger headings)

### Animation Additions
- ✅ Scroll reveal (Framer Motion `whileInView`)
- ✅ Hover effects (scale, shadow, translate)
- ✅ Stagger animations for lists
- ✅ Page transitions
- ✅ Loading states with skeleton screens

### More Sections
- ✅ Social proof (testimonials, logos)
- ✅ FAQ section
- ✅ Pricing comparison
- ✅ Team showcase
- ✅ Case studies
- ✅ Newsletter signup

---

## 🎯 COMMON TASKS - QUICK REFERENCE

### Adding a New Page
```bash
1. Create app/[route]/page.tsx
2. Use Section + Container components
3. Add to Navigation links
4. Test responsive design
5. Add meta tags (export const metadata)
```

### Adding a New Component
```bash
1. Check COMPONENT_LIBRARY.md first
2. Create in appropriate folder
3. Type all props
4. Use design tokens
5. Test in isolation
6. Document in COMPONENT_LIBRARY.md if reusable
```

### Fixing a Bug
```bash
1. Reproduce the issue
2. Check browser console
3. Check TypeScript errors
4. Check linter errors (npm run lint)
5. Fix and test
6. Run npm run format
```

### Styling Something
```bash
1. Check design-system.md for tokens
2. Use Tailwind classes only
3. Follow responsive pattern (mobile-first)
4. Test all breakpoints
5. Add hover/focus states
```

---

## 🚨 ABSOLUTE RULES (NEVER BREAK)

1. ❌ **NEVER** use inline styles (`style={{...}}`)
2. ❌ **NEVER** use relative imports (`../../`)
3. ❌ **NEVER** commit without running `npm run format`
4. ❌ **NEVER** use `any` type in TypeScript
5. ❌ **NEVER** skip alt text on images
6. ❌ **NEVER** create components without TypeScript types
7. ❌ **NEVER** use `<img>` tag (use Next.js `<Image>`)
8. ❌ **NEVER** ignore ESLint warnings
9. ❌ **NEVER** add "use client" without reason
10. ❌ **NEVER** break the established file structure

---

## 📖 REFERENCE DOCUMENTS

When in doubt, consult these (in order):

1. **PROJECT_RULES.md** (this file) - General rules
2. **design-system.md** - Design tokens and patterns
3. **ARCHITECTURE.md** - File structure and conventions
4. **COMPONENT_LIBRARY.md** - Existing components
5. **SETUP_COMPLETE.md** - Project overview

---

## 🤖 AI ASSISTANT WORKFLOW

When working on this project:

### Before Starting Any Task:
1. Read the relevant documentation
2. Check existing components
3. Understand the architecture
4. Plan the approach

### While Coding:
1. Follow all rules in this document
2. Use existing components when possible
3. Match the established patterns
4. Write clean, typed code

### After Completing:
1. Check for linter errors
2. Format code with Prettier
3. Test responsive design
4. Verify accessibility
5. Update documentation if needed

### When Uncertain:
1. Ask for clarification
2. Reference documentation
3. Follow established patterns
4. Choose the safest option

---

**These rules ensure consistency, quality, and maintainability.**

*Last updated: November 2025*

