# ⚡ Quick Start Guide

## 🚀 Start Developing in 60 Seconds

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# http://localhost:3000
```

---

## 📋 Most Common Tasks

### Creating a New Page

```tsx
// app/my-page/page.tsx
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";

export default function MyPage() {
  return (
    <Section padding="lg">
      <Container>
        <h1 className="text-5xl font-bold mb-4">My Page</h1>
        <p className="text-xl text-gray-600">Content here</p>
      </Container>
    </Section>
  );
}
```

### Adding a Feature Grid

```tsx
import FeatureCard from "@/components/ui/FeatureCard";
import { Sparkles, Zap, Users } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Feature 1",
    description: "Description here",
  },
  {
    icon: Zap,
    title: "Feature 2",
    description: "Description here",
  },
  {
    icon: Users,
    title: "Feature 3",
    description: "Description here",
  },
];

<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {features.map((f) => (
    <FeatureCard key={f.title} {...f} />
  ))}
</div>;
```

### Creating a Hero Section

```tsx
<Section padding="xl" background="gradient">
  <Container>
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-6">
        Your Amazing Headline
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Your compelling subheadline that explains the value proposition.
      </p>
      <Link
        href="/apply"
        className="inline-flex items-center gap-2 bg-[#5851ea] hover:bg-[#4641d9] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
      >
        Get Started
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  </Container>
</Section>
```

---

## 🎨 Design Tokens Cheat Sheet

### Colors
```tsx
// Primary brand
className="bg-[#5851ea] text-white"
className="hover:bg-[#4641d9]"

// Text
className="text-gray-900"  // Headings
className="text-gray-600"  // Body
className="text-gray-500"  // Muted

// Backgrounds
className="bg-white"       // Default
className="bg-gray-50"     // Light section
```

### Spacing
```tsx
className="p-4"    // 16px
className="p-6"    // 24px
className="p-8"    // 32px
className="gap-4"  // Grid/flex gap
className="mb-6"   // Margin bottom
```

### Typography
```tsx
className="text-6xl font-bold"         // Hero headline
className="text-4xl font-bold"         // Section heading
className="text-2xl font-semibold"     // Card heading
className="text-xl text-gray-600"      // Subheading
className="text-base"                  // Body text
```

### Buttons
```tsx
// Primary
className="bg-[#5851ea] hover:bg-[#4641d9] text-white px-6 py-3 rounded-lg font-semibold transition-colors"

// Secondary
className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-lg font-semibold border border-gray-300 transition-colors"

// Ghost
className="bg-transparent hover:bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
```

### Cards
```tsx
// Basic card
className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"

// Elevated card
className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
```

---

## 📱 Responsive Grid Patterns

### Two Columns
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

### Three Columns
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Four Columns
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {items.map((item) => (
    <div key={item.id}>{item.content}</div>
  ))}
</div>
```

---

## 🎭 Animation Snippets

### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

### Slide Up
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  {children}
</motion.div>
```

### Scroll Reveal
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4 }}
>
  {children}
</motion.div>
```

### Stagger Children
```tsx
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  variants={{
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## 🔍 Icons Quick Reference

```tsx
import {
  Sparkles,      // AI/magic
  Zap,           // Speed
  Users,         // Team
  Brain,         // Intelligence
  Target,        // Goals
  TrendingUp,    // Growth
  CheckCircle2,  // Success
  ArrowRight,    // CTA/nav
  Menu,          // Mobile menu open
  X,             // Close/dismiss
} from "lucide-react";

<Sparkles className="w-6 h-6 text-[#5851ea]" />
```

Browse all: [lucide.dev](https://lucide.dev)

---

## 🖼️ Image Usage

```tsx
import Image from "next/image";

// Above the fold
<Image
  src="/assets/images/hero.jpg"
  alt="Descriptive alt text"
  width={1920}
  height={1080}
  priority
  className="rounded-2xl"
/>

// Below the fold
<Image
  src="/assets/images/feature.jpg"
  alt="Descriptive alt text"
  width={800}
  height={600}
  loading="lazy"
  className="rounded-lg"
/>
```

---

## 🧩 Component Imports

```tsx
// Layout
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

// UI Primitives
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FeatureCard from "@/components/ui/FeatureCard";

// Global
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// Utils
import { cn } from "@/lib/utils";
```

---

## ⚡ Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm start                # Start production server

# Code Quality
npm run lint             # Check linting
npm run format           # Format all files
npm run format:check     # Check formatting
```

---

## 📚 Documentation Index

| File | Use When |
|------|----------|
| **QUICK_START.md** | Need quick syntax reference (you are here) |
| **PROJECT_RULES.md** | Want to know the rules |
| **design-system.md** | Need design tokens/specs |
| **COMPONENT_LIBRARY.md** | Looking for a component |
| **ARCHITECTURE.md** | Understanding structure |
| **SETUP_COMPLETE.md** | Full project overview |

---

## 🎯 5-Second Rule Check

Before committing, ask yourself:

- ✅ Did I use Tailwind (no inline styles)?
- ✅ Did I type my props?
- ✅ Did I test on mobile?
- ✅ Did I add alt text to images?
- ✅ Did I format the code?

If yes to all → You're good to go! 🚀

---

## 💡 Pro Tips

1. **Start with the components** - Check `COMPONENT_LIBRARY.md` before building
2. **Copy patterns** - Look at existing pages for proven patterns
3. **Mobile first** - Style for mobile, then add `md:` and `lg:` classes
4. **Use the design system** - Don't invent new colors or spacing
5. **Keep it simple** - Prefer existing components over custom solutions

---

## 🆘 Troubleshooting

### TypeScript Error
```bash
# Check tsconfig.json paths are correct
# Make sure all props are typed
# Run: npm run lint
```

### Styling Not Working
```bash
# Make sure Tailwind classes are correct
# Check for typos
# Verify globals.css is imported
# Clear .next cache: rm -rf .next
```

### Component Not Found
```bash
# Verify import path uses @/ alias
# Check component file exists
# Ensure proper export (default vs named)
```

---

**Keep this file handy for quick reference!** 📌

*Last updated: November 2025*

