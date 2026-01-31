# 🎯 Wilma Frontend

> **AI-Powered Recruitment Platform** - Modern Next.js application with production-ready architecture

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[QUICK_START.md](./QUICK_START.md)** | ⚡ Quick reference guide for common tasks |
| **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** | 📋 Complete setup overview |
| **[PROJECT_RULES.md](./PROJECT_RULES.md)** | 📏 Development rules and conventions |
| **[design-system.md](./design-system.md)** | 🎨 Design tokens, colors, typography |
| **[COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)** | 🧩 Reusable component reference |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | 🏗️ Project structure and architecture |

---

## ✨ Features

### 🎨 Complete Design System
- Comprehensive design tokens
- Consistent color palette (#5851ea purple brand)
- Typography scale (Display → Heading → Body)
- Component patterns and variants
- Responsive grid system

### 🧱 Component Library
- Navigation & Footer (global)
- Container & Section (layout)
- FeatureCard (content)
- UI primitives (Button, Card, Badge, etc.)
- TypeScript typed components

### 🎭 Modern UX
- Framer Motion animations
- Smooth scroll reveals
- Responsive mobile menu
- Backdrop blur effects
- Hover transitions

### ♿ Accessibility
- Semantic HTML throughout
- ARIA labels on interactive elements
- Focus visible styles
- Keyboard navigation support
- Alt text on all images

### 🚀 Performance
- Server Components by default
- Next.js Image optimization
- Code splitting ready
- CSS-in-JS via Tailwind
- Fast page loads

### 🔧 Developer Experience
- TypeScript strict mode
- ESLint + Prettier
- Path aliases (`@/`)
- Hot reload
- Comprehensive docs

---

## 🎯 Tech Stack

### Core
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with Server Components
- **TypeScript** - Type-safe development

### Styling
- **Tailwind CSS v4** - Utility-first CSS
- **Framer Motion** - Animation library
- **Lucide Icons** - Beautiful icon set

### State Management
- **Zustand** - Lightweight state management
- **React Hooks** - Built-in state handling

### Code Quality
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

---

## 📁 Project Structure

```
WilmaFrontend/
├── public/
│   └── assets/
│       ├── images/          # Product images
│       └── icons/           # Custom icons
│
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Homepage
│   │   ├── jobs/            # Job listings
│   │   ├── apply/           # Application flow
│   │   ├── interview/       # Interview experience
│   │   └── admin/           # Admin dashboard
│   │
│   ├── components/
│   │   ├── Navigation.tsx   # Global nav
│   │   ├── Footer.tsx       # Global footer
│   │   └── ui/              # Reusable components
│   │
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities & types
│   └── store/               # Zustand stores
│
├── design-system.md         # Design documentation
├── ARCHITECTURE.md          # Technical docs
└── package.json
```

---

## 🎨 Design System Highlights

### Brand Colors
```css
Primary:    #5851ea  /* Purple */
Hover:      #4641d9  /* Darker purple */
Success:    #10b981  /* Green */
Error:      #ef4444  /* Red */
```

### Usage Examples

#### Hero Section
```tsx
<Section padding="xl" background="gradient">
  <Container>
    <h1 className="text-6xl font-bold">Headline</h1>
    <p className="text-xl text-gray-600">Subheadline</p>
    <Button>Get Started</Button>
  </Container>
</Section>
```

#### Feature Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <FeatureCard icon={Sparkles} title="AI-Powered" description="..." />
  <FeatureCard icon={Zap} title="Fast" description="..." />
  <FeatureCard icon={Users} title="Team" description="..." />
</div>
```

---

## 🛠️ Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm start             # Start production server
npm run lint          # Run ESLint
npm run format        # Format with Prettier
npm run format:check  # Check formatting
```

---

## 📱 Pages

### ✅ Live Pages

| Route | Description |
|-------|-------------|
| `/` | Modern landing page with hero, features, benefits |
| `/jobs` | Job listings with AI assistant |
| `/apply` | Candidate application flow |
| `/interview` | Real-time AI interview |
| `/admin` | Recruiter dashboard |

---

## 🎓 Getting Started

### For New Developers

1. **Read** [QUICK_START.md](./QUICK_START.md) for syntax reference
2. **Check** [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) for available components
3. **Follow** [PROJECT_RULES.md](./PROJECT_RULES.md) for conventions
4. **Reference** [design-system.md](./design-system.md) for design specs

### For Building Features

1. Check if components already exist
2. Use Section + Container for layout
3. Follow mobile-first responsive approach
4. Add TypeScript types to all props
5. Test on multiple screen sizes

---

## 🤝 Development Workflow

### Starting a Task
1. Pull latest changes
2. Create feature branch (if using git)
3. Review relevant documentation

### While Coding
1. Use existing components from library
2. Follow design system tokens
3. Write TypeScript types
4. Test responsive design

### Before Committing
1. Run `npm run format`
2. Run `npm run lint`
3. Check for TypeScript errors
4. Test in browser

---

## 🎯 Key Principles

### ✅ DO
- Use Tailwind CSS for all styling
- Use Server Components by default
- Create small, reusable components
- Follow the design system
- Type everything with TypeScript
- Test responsive design
- Add accessibility features

### ❌ DON'T
- Use inline styles
- Use relative imports (use `@/` instead)
- Skip TypeScript types
- Ignore mobile views
- Create components without checking library first
- Use `any` type
- Skip alt text on images

---

## 🔍 Component Quick Reference

```tsx
// Layout
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

// UI Primitives
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FeatureCard from "@/components/ui/FeatureCard";

// Icons
import { Sparkles, Zap, Users } from "lucide-react";

// Utils
import { cn } from "@/lib/utils";
```

---

## 🌟 What Makes This Special

### Production-Ready
- ✅ Complete design system
- ✅ Reusable component library
- ✅ TypeScript throughout
- ✅ Comprehensive documentation
- ✅ Code quality tools configured

### Modern Architecture
- ✅ Next.js 16 App Router
- ✅ React 19 Server Components
- ✅ Tailwind CSS v4
- ✅ Framer Motion animations
- ✅ Responsive mobile-first design

### Developer Experience
- ✅ Clear file structure
- ✅ Consistent conventions
- ✅ Path aliases configured
- ✅ ESLint + Prettier
- ✅ Extensive documentation

---

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev)
- [TypeScript](https://www.typescriptlang.org/)

---

## 🆘 Need Help?

1. Check [QUICK_START.md](./QUICK_START.md) for syntax
2. Search [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) for components
3. Review [design-system.md](./design-system.md) for design tokens
4. Read [PROJECT_RULES.md](./PROJECT_RULES.md) for conventions

---

## 📄 License

Private - Wilma Team

---

**Built with ❤️ using Next.js, React, TypeScript, and Tailwind CSS**

*Last updated: November 2025*
