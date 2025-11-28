# Wilma Component Library

## 📚 Overview

This document provides a quick reference for all reusable components in the Wilma frontend. Use these as building blocks for consistent, production-quality UI.

---

## 🎯 Layout Components

### Container
**Location**: `@/components/ui/Container`

Provides consistent max-width container with responsive padding.

```tsx
import Container from "@/components/ui/Container";

<Container size="xl" className="py-8">
  {children}
</Container>
```

**Props:**
- `size`: `"sm" | "md" | "lg" | "xl" | "full"` (default: `"xl"`)
- `className`: Optional additional classes
- `children`: ReactNode

**Size Guide:**
- `sm`: max-w-3xl (~768px)
- `md`: max-w-5xl (~1024px)
- `lg`: max-w-6xl (~1152px)
- `xl`: max-w-7xl (~1280px)
- `full`: max-w-full

---

### Section
**Location**: `@/components/ui/Section`

Page section wrapper with consistent padding and background options. Includes Container internally.

```tsx
import Section from "@/components/ui/Section";

<Section padding="lg" background="gray" containerSize="xl">
  {children}
</Section>
```

**Props:**
- `padding`: `"none" | "sm" | "md" | "lg" | "xl"` (default: `"lg"`)
- `background`: `"default" | "gray" | "gradient"` (default: `"default"`)
- `containerSize`: Same as Container size prop
- `className`: Optional additional classes
- `children`: ReactNode

---

## 🧱 UI Primitives

### Button
**Location**: `@/components/ui/button`

Already exists in your codebase via shadcn/ui.

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg">
  Click me
</Button>
```

**Variants:** default, destructive, outline, secondary, ghost, link

---

### Card
**Location**: `@/components/ui/card`

Pre-built card components for consistent styling.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

---

### Badge
**Location**: `@/components/ui/badge`

Small status indicators and labels.

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="default">New</Badge>
<Badge variant="secondary">In Progress</Badge>
```

---

### Input & Textarea
**Location**: `@/components/ui/input`, `@/components/ui/textarea`

Form input components.

```tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

<Input type="email" placeholder="Email address" />
<Textarea placeholder="Your message" rows={4} />
```

---

### FeatureCard
**Location**: `@/components/ui/FeatureCard`

Display a feature with icon, title, and description.

```tsx
import FeatureCard from "@/components/ui/FeatureCard";
import { Sparkles } from "lucide-react";

<FeatureCard
  icon={Sparkles}
  title="AI-Powered"
  description="Intelligent candidate screening using advanced AI"
/>
```

**Props:**
- `icon`: LucideIcon component
- `title`: string
- `description`: string
- `className`: Optional styling
- `iconClassName`: Optional icon wrapper styling

---

## 🧭 Global Components

### Navigation
**Location**: `@/components/Navigation`

Global navigation bar with mobile menu support.

- Automatically included in root layout
- Sticky positioning
- Responsive mobile menu
- Backdrop blur effect

```tsx
// Already in layout.tsx, but can be customized:
import Navigation from "@/components/Navigation";

<Navigation />
```

---

### Footer
**Location**: `@/components/Footer`

Global footer with links and social icons.

- Automatically included in root layout
- Responsive grid layout
- Social media links
- Organized link sections

```tsx
// Already in layout.tsx
import Footer from "@/components/Footer";

<Footer />
```

---

## 🎥 Feature Components

### JobCard
**Location**: `@/components/JobCard`

Displays job posting with details.

```tsx
import { JobCard } from "@/components/JobCard";

<JobCard job={jobData} />
```

---

### CVUploader
**Location**: `@/components/CVUploader`

File upload component for candidate CVs.

```tsx
import CVUploader from "@/components/CVUploader";

<CVUploader onUpload={handleUpload} />
```

---

### VideoCall
**Location**: `@/components/VideoCall`

Real-time video interview component.

```tsx
import VideoCall from "@/components/VideoCall";

<VideoCall />
```

---

### ProgressRing
**Location**: `@/components/ProgressRing`

Circular progress indicator.

```tsx
import ProgressRing from "@/components/ProgressRing";

<ProgressRing progress={75} />
```

---

## 🎨 Design Tokens

Use these in your components for consistency:

### Colors
```tsx
// Primary brand color
className="bg-[#5851ea] text-white"
className="hover:bg-[#4641d9]"

// Success
className="text-green-500"

// Error
className="text-red-500"

// Neutrals
className="bg-gray-50"    // Light background
className="text-gray-600" // Muted text
className="text-gray-900" // Primary text
```

### Spacing
```tsx
className="p-4"    // 16px padding
className="p-6"    // 24px padding
className="p-8"    // 32px padding
className="gap-4"  // 16px gap
className="gap-6"  // 24px gap
```

### Border Radius
```tsx
className="rounded-lg"   // 8px - buttons, inputs
className="rounded-xl"   // 12px - cards
className="rounded-2xl"  // 16px - sections
className="rounded-full" // circular
```

### Shadows
```tsx
className="shadow-sm"   // Subtle
className="shadow-md"   // Medium
className="shadow-lg"   // Large
className="shadow-xl"   // Extra large
```

---

## 🎭 Animation Patterns

### Framer Motion - Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

### Framer Motion - Slide Up
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  {children}
</motion.div>
```

### Framer Motion - Scroll Reveal
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

### Tailwind Transitions
```tsx
className="transition-all duration-200"
className="hover:shadow-lg transition-shadow"
className="group-hover:translate-x-1 transition-transform"
```

---

## 🔍 Icons

Using **Lucide React** for icons:

```tsx
import { Sparkles, Zap, Users, ArrowRight } from "lucide-react";

<Sparkles className="w-6 h-6 text-[#5851ea]" />
<ArrowRight className="w-4 h-4" />
```

**Common Icons:**
- `Sparkles` - AI/magic features
- `Zap` - Speed/performance
- `Users` - Team/collaboration
- `Brain` - Intelligence/AI
- `Target` - Goals/precision
- `TrendingUp` - Growth/analytics
- `CheckCircle2` - Success/completion
- `ArrowRight` - Navigation/CTAs
- `Menu`, `X` - Mobile menu

Browse all: [lucide.dev](https://lucide.dev)

---

## 📝 Usage Examples

### Hero Section Pattern
```tsx
<Section padding="xl" background="gradient">
  <Container>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <h1 className="text-6xl font-bold mb-6">
        Your Headline
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Your subheadline
      </p>
      <Button size="lg">Get Started</Button>
    </motion.div>
  </Container>
</Section>
```

### Feature Grid Pattern
```tsx
<Section padding="lg">
  <Container>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map((feature) => (
        <FeatureCard key={feature.title} {...feature} />
      ))}
    </div>
  </Container>
</Section>
```

### Two-Column Layout Pattern
```tsx
<Section>
  <Container>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-4xl font-bold mb-4">Heading</h2>
        <p className="text-xl text-gray-600">Content</p>
      </div>
      <div>
        {/* Image or visual */}
      </div>
    </div>
  </Container>
</Section>
```

---

## 🚀 Quick Start Checklist

When building a new page:

1. ✅ Start with `<Section>` for each major area
2. ✅ Use `<Container>` inside sections (or let Section handle it)
3. ✅ Choose UI primitives from `@/components/ui/`
4. ✅ Add Framer Motion for scroll animations
5. ✅ Use Lucide icons consistently
6. ✅ Apply design tokens (colors, spacing, etc.)
7. ✅ Test on mobile (responsive breakpoints)
8. ✅ Add proper alt text for images
9. ✅ Check accessibility (focus states, ARIA labels)

---

*For detailed design specifications, see [design-system.md](./design-system.md)*
*For architecture decisions, see [ARCHITECTURE.md](./ARCHITECTURE.md)*

