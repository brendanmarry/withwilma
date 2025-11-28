# Assets Directory

## Structure

```
assets/
├── images/       # Product images, hero images, screenshots
├── icons/        # Custom icon files (SVG preferred)
└── README.md     # This file
```

## Image Guidelines

### File Naming Convention
- Use kebab-case: `hero-background.jpg`
- Be descriptive: `candidate-dashboard-screenshot.png`
- Include size suffix for variants: `logo-small.svg`, `logo-large.svg`

### Image Optimization
- **Hero images**: Max 2000px width, WebP/AVIF format
- **Thumbnails**: 400px width, WebP format
- **Icons**: SVG format preferred, 24x24px artboard
- **Avatars**: 256x256px, WebP format

### Formats
- **SVG**: For logos, icons, illustrations
- **WebP/AVIF**: For photos and complex images
- **PNG**: For images requiring transparency (fallback)

### Example Usage

```tsx
import Image from "next/image";

// Hero image
<Image
  src="/assets/images/hero-background.jpg"
  alt="Wilma AI recruitment assistant dashboard"
  width={1920}
  height={1080}
  priority
  className="rounded-2xl"
/>

// Thumbnail
<Image
  src="/assets/images/feature-thumbnail.webp"
  alt="AI-powered candidate screening"
  width={400}
  height={300}
  loading="lazy"
  className="rounded-lg"
/>
```

## AI Image Generation Prompts

When you need images, use these prompts as templates:

### Hero/Banner Images
```
A modern, professional recruitment office with diverse people collaborating, 
clean minimal aesthetic, soft natural lighting, purple and blue color accents 
(#5851ea), photorealistic, 16:9 aspect ratio, high detail
```

### Feature Illustrations
```
Minimalist vector illustration of [feature description], flat design style, 
purple (#5851ea) and gray color scheme, clean lines, white background, 
professional, modern
```

### Dashboard Screenshots
```
Modern web application dashboard interface for recruitment software, 
clean UI/UX design, purple accent color (#5851ea), data visualization, 
candidate profiles, light theme, professional
```

