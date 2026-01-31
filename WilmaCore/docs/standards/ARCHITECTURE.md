# Wilma Frontend Architecture

## 🏗️ Project Structure

```
WilmaFrontend/
├── public/
│   ├── assets/
│   │   ├── images/          # Product images, hero images
│   │   └── icons/           # Custom icon files
│   └── *.svg                # Default Next.js assets
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout with Navigation & Footer
│   │   ├── page.tsx         # Homepage
│   │   ├── globals.css      # Global styles + design tokens
│   │   └── [route]/         # Feature routes
│   ├── components/
│   │   ├── Navigation.tsx   # Global navigation bar
│   │   ├── Footer.tsx       # Global footer
│   │   ├── ui/              # Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── Container.tsx
│   │   │   ├── Section.tsx
│   │   │   └── FeatureCard.tsx
│   │   └── [feature]/       # Feature-specific components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities, helpers, types
│   └── store/               # State management (Zustand)
├── design-system.md         # Design system documentation
├── ARCHITECTURE.md          # This file
└── package.json
```

## 📐 Architecture Principles

### 1. **Component Hierarchy**
```
Layout Components (Navigation, Footer)
  ↓
Page Components (app/*/page.tsx)
  ↓
Section Components (Hero, Features, CTA)
  ↓
Feature Components (specific functionality)
  ↓
UI Primitives (Button, Card, Input)
```

### 2. **Component Organization**

#### UI Primitives (`/src/components/ui/`)
- **Purpose**: Reusable, atomic components
- **Examples**: Button, Card, Input, Badge
- **Rules**:
  - No business logic
  - Highly composable
  - Style variants via props
  - Fully typed with TypeScript

#### Feature Components (`/src/components/`)
- **Purpose**: Feature-specific, composed components
- **Examples**: CVUploader, VideoCall, JobCard
- **Rules**:
  - Can contain business logic
  - Use UI primitives
  - Co-locate with feature if only used once

#### Layout Components
- **Purpose**: App-wide layout structure
- **Examples**: Navigation, Footer, Container, Section
- **Rules**:
  - Define consistent spacing
  - Handle responsive behavior
  - Provide semantic structure

### 3. **File Naming Conventions**

```
PascalCase.tsx     → Components (Button.tsx, FeatureCard.tsx)
kebab-case.ts      → Utilities (api-client.ts, format-date.ts)
kebab-case/        → Route folders (app/apply/, app/admin/)
UPPERCASE.md       → Documentation (README.md, ARCHITECTURE.md)
```

### 4. **Import Aliases**

```tsx
import Navigation from "@/components/Navigation";    // Absolute path
import { cn } from "@/lib/utils";                    // Utilities
import { useInterview } from "@/hooks/useInterview"; // Hooks
import type { Job } from "@/lib/types";              // Types
```

Configured in `tsconfig.json`:
```json
"paths": {
  "@/*": ["./src/*"]
}
```

## 🎨 Styling Strategy

### Tailwind CSS First
- **Default approach**: Use Tailwind utility classes
- **Rationale**: Fast prototyping, consistent design, no CSS sprawl
- **Example**:
  ```tsx
  <button className="bg-[#5851ea] hover:bg-[#4641d9] px-6 py-3 rounded-lg">
    Click me
  </button>
  ```

### CSS Variables for Theme
- **Location**: `app/globals.css`
- **Purpose**: Brand colors, semantic colors, design tokens
- **Example**:
  ```css
  :root {
    --brand-primary: #5851ea;
    --success: #10b981;
  }
  ```

### No Inline Styles
- ❌ **Never**: `style={{ color: 'red' }}`
- ✅ **Instead**: `className="text-red-500"`

### Component Variants
Use `class-variance-authority` (CVA) for complex variants:
```tsx
const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      primary: "bg-[#5851ea] text-white",
      secondary: "bg-white text-gray-900 border",
    },
    size: {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
    },
  },
});
```

## 🔄 State Management

### Client State (Zustand)
- **Location**: `/src/store/`
- **Use for**: Interview state, UI state, form data
- **Example**:
  ```tsx
  import { useInterviewStore } from "@/store/interview-store";
  
  const { currentQuestion, nextQuestion } = useInterviewStore();
  ```

### Server State (React Query - if needed)
- **Use for**: API data fetching, caching, revalidation
- **Location**: `/src/hooks/use[Feature]Query.ts`

### Form State (React Hook Form - if needed)
- **Use for**: Complex forms with validation
- **Integrate with**: Zod for schema validation

## 🚀 Performance Best Practices

### 1. **Next.js Image Optimization**
```tsx
import Image from "next/image";

// Hero image (above-the-fold)
<Image src="/hero.jpg" alt="..." priority width={1920} height={1080} />

// Below-the-fold images
<Image src="/feature.jpg" alt="..." loading="lazy" width={800} height={600} />
```

### 2. **Server Components by Default**
```tsx
// Default: Server Component (faster initial load)
export default function Page() {
  return <div>Static content</div>;
}

// Only when needed: Client Component
"use client";
export default function InteractiveComponent() {
  const [state, setState] = useState();
  return <div>{state}</div>;
}
```

### 3. **Code Splitting**
```tsx
import dynamic from "next/dynamic";

// Lazy load heavy components
const VideoCall = dynamic(() => import("@/components/VideoCall"), {
  loading: () => <p>Loading...</p>,
});
```

### 4. **Framer Motion Performance**
```tsx
// Use layout animations for better performance
<motion.div layoutId="card" />

// Prefer transform/opacity animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
/>
```

## ♿ Accessibility Requirements

### 1. **Semantic HTML**
```tsx
// ✅ Good
<nav>
  <ul><li><a href="/">Home</a></li></ul>
</nav>

// ❌ Bad
<div className="nav">
  <div onClick={...}>Home</div>
</div>
```

### 2. **ARIA Labels**
```tsx
<button aria-label="Close modal">
  <X className="w-4 h-4" />
</button>
```

### 3. **Focus Management**
- Visible focus rings (defined in globals.css)
- Keyboard navigation support
- Skip links for screen readers

### 4. **Alt Text**
```tsx
// Meaningful images
<Image src="..." alt="Candidate dashboard showing match scores" />

// Decorative images
<Image src="..." alt="" role="presentation" />
```

## 🧪 Testing Strategy (Future)

### Unit Tests
- **Tool**: Jest + React Testing Library
- **Target**: UI primitives, utility functions
- **Location**: `__tests__/` next to component

### Integration Tests
- **Tool**: Playwright
- **Target**: User flows (application process, interview)
- **Location**: `/tests/integration/`

### E2E Tests
- **Tool**: Playwright
- **Target**: Critical paths
- **Location**: `/tests/e2e/`

## 📦 Build & Deployment

### Build Command
```bash
npm run build
```

### Development
```bash
npm run dev  # http://localhost:3000
```

### Production Checklist
- ✅ Images optimized (WebP/AVIF)
- ✅ Bundle size < 200KB (gzipped)
- ✅ Lighthouse score > 90
- ✅ No console errors
- ✅ SEO meta tags configured
- ✅ Analytics integrated (if needed)

## 🔗 Integration Points

### Backend API
- **Base URL**: Configured via `NEXT_PUBLIC_API_URL` environment variable
- **Location**: API calls in `/src/lib/api.ts`
- **Auth**: Handled via cookies or JWT

### External Services
- **OpenAI Realtime API**: For voice interviews
- **MinIO/S3**: For file uploads (CVs, documents)

## 📚 Documentation Standards

### Component Documentation
```tsx
/**
 * FeatureCard - Displays a feature with icon, title, and description
 * 
 * @param icon - Lucide icon component
 * @param title - Feature title
 * @param description - Feature description text
 * @param className - Optional additional classes
 * 
 * @example
 * <FeatureCard
 *   icon={Sparkles}
 *   title="AI-Powered"
 *   description="Intelligent candidate screening"
 * />
 */
```

### Function Documentation
```tsx
/**
 * Formats a date string to human-readable format
 * @param date - ISO date string
 * @returns Formatted date (e.g., "Jan 15, 2025")
 */
export function formatDate(date: string): string { ... }
```

## 🚦 Code Quality Tools

- **ESLint**: Linting (eslint.config.mjs)
- **Prettier**: Code formatting (.prettierrc)
- **TypeScript**: Type safety (tsconfig.json)
- **Husky**: Git hooks (future)
- **lint-staged**: Pre-commit linting (future)

---

*Last updated: November 2025*

