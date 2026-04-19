# Testifaith Design Guidelines
**Premium Faith-Based Design System**

Inspired by YouVersion Bible's excellence - modern, clean, and uplifting.

---

## Design Philosophy

**Modern Faith Experience**
Create a digital sanctuary that feels contemporary and trustworthy. Every interaction should feel smooth, intentional, and beautiful - honoring both the sacred nature of testimonies and modern design excellence.

**Core Values:**
- **Premium Quality**: Polished, professional, delightful
- **Spiritual Warmth**: Welcoming, peaceful, hopeful
- **Modern Simplicity**: Clean, uncluttered, intuitive
- **Joyful Engagement**: Smooth animations, satisfying interactions

---

## Color System

### Light Mode (Primary)
**Foundation:**
- `--background`: Pure white (0 0% 100%) - Crisp, clean canvas
- `--card`: White with subtle elevation (0 0% 100%)
- `--foreground`: Deep slate (215 25% 27%) - Excellent readability

**Brand Colors:**
- `--primary`: Vibrant sky blue (212 95% 54%) - Energetic, hopeful, action
- `--primary-hover`: Deeper blue (212 95% 48%)
- `--secondary`: Soft amber gold (38 92% 50%) - Warmth, divine light
- `--accent`: Gentle purple (262 52% 47%) - Spiritual depth

**Semantic:**
- `--success`: Fresh green (142 71% 45%) - Growth, healing
- `--muted`: Light gray (215 16% 97%) - Backgrounds, surfaces
- `--muted-foreground`: Medium gray (215 16% 47%) - Secondary text
- `--border`: Very light gray (215 16% 92%) - Subtle divisions

**Interaction Colors:**
- `--amen`: Peaceful emerald (158 64% 52%) - Hope, affirmation
- `--encourage`: Warm coral (14 86% 58%) - Energy, support

### Dark Mode
- `--background`: Deep charcoal (222 47% 11%)
- `--card`: Elevated dark (217 33% 17%)
- `--foreground`: Soft white (210 40% 98%)
- `--primary`: Bright sky (212 95% 60%)
- `--border`: Dark gray (215 27% 22%)

---

## Typography

**Font Stack:**
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif
--font-display: 'Inter', sans-serif  /* 700-800 weight for impact */
--font-serif: 'Crimson Pro', Georgia, serif  /* Quotes, scripture only */
```

**Scale & Usage:**
- **Hero Display**: text-5xl md:text-7xl font-bold tracking-tight
- **Page Headers**: text-3xl md:text-5xl font-bold tracking-tight
- **Section Titles**: text-2xl md:text-3xl font-semibold
- **Card Titles**: text-lg md:text-xl font-semibold
- **Body Text**: text-base leading-relaxed (line-height: 1.7)
- **Small Text**: text-sm leading-normal
- **Micro Text**: text-xs

**Font Weights:**
- Regular: 400 (body text)
- Medium: 500 (emphasis, labels)
- Semibold: 600 (headings, card titles)
- Bold: 700 (page headers, CTAs)
- Extra Bold: 800 (hero, display)

---

## Spacing & Layout

**Consistent Scale (Tailwind units):**
- **Micro**: 1, 2 (4px, 8px)
- **Small**: 3, 4 (12px, 16px)
- **Medium**: 6, 8 (24px, 32px)
- **Large**: 12, 16 (48px, 64px)
- **XL**: 20, 24, 32 (80px, 96px, 128px)

**Container Strategy:**
- **Full width**: `container mx-auto px-4 md:px-6 lg:px-8`
- **Max widths**: `max-w-7xl` for sections, `max-w-2xl` for reading content
- **Section padding**: `py-12 md:py-16 lg:py-24`
- **Card spacing**: `gap-4 md:gap-6`

---

## Component Design

### Cards & Surfaces
**Testimony Cards:**
```
- Background: bg-card (white/elevated)
- Border: border border-border (very subtle)
- Rounded: rounded-2xl (generous radius)
- Shadow: shadow-sm hover:shadow-md (elevation on hover)
- Padding: p-6 md:p-8 (generous breathing room)
- Transition: transition-all duration-200
```

**Card Hover:**
- Transform: -translate-y-1 (gentle lift)
- Shadow: shadow-md (enhanced elevation)
- Border: border-primary/20 (subtle color hint)

### Buttons

**Primary Button:**
```
- Background: bg-primary
- Text: text-white font-medium
- Padding: px-6 py-3 md:px-8 md:py-4
- Rounded: rounded-xl
- Shadow: shadow-md hover:shadow-lg
- Transform: hover:-translate-y-0.5 active:translate-y-0
```

**Ghost Button:**
- Transparent background
- hover:bg-muted transition
- Border: none or border-border for outlined

### Navigation
**Header:**
- Sticky: sticky top-0 z-50
- Background: bg-white/95 backdrop-blur-md (frosted glass)
- Border: border-b border-border
- Shadow: shadow-sm
- Height: h-16 md:h-20

### Badges & Tags
**Category Badges:**
- Small: px-3 py-1 rounded-full text-xs font-medium
- Color-coded per category with subtle backgrounds
- Examples:
  - Healing: bg-emerald-100 text-emerald-700
  - Marriage: bg-rose-100 text-rose-700
  - Finance: bg-amber-100 text-amber-700
  - Breakthrough: bg-blue-100 text-blue-700

---

## Interactions & Motion

**Animation Principles:**
- **Purposeful**: Every animation serves a function
- **Quick**: 150-300ms for most interactions
- **Smooth**: ease-out for natural deceleration
- **Delightful**: Subtle spring physics where appropriate

**Hover States:**
```css
transition-all duration-200 ease-out
hover:-translate-y-1 hover:shadow-md
```

**Active/Press:**
```css
active:scale-[0.98] active:translate-y-0
```

**Loading States:**
- Skeleton screens with shimmer animation
- Pulse for interactive elements awaiting response
- Smooth fade-in (200ms) when content loads

**Micro-interactions:**
- Heart/Amen button: Scale + color change
- Like counter: Number slides up with new count
- Toast notifications: Slide from bottom-right
- Form submit: Button width animation + checkmark

---

## Category Color System

Vibrant but tasteful color coding:

```
Healing: emerald-500 (#10b981)
Marriage: rose-500 (#f43f5e)  
Fruitfulness: violet-500 (#8b5cf6)
Finance: amber-500 (#f59e0b)
Breakthrough: sky-500 (#0ea5e9)
Deliverance: indigo-500 (#6366f1)
Others: slate-500 (#64748b)
```

Use as:
- Badge backgrounds: `{color}-100` 
- Badge text: `{color}-700`
- Accent borders: `{color}-200`
- Hover states: `{color}-50`

---

## Responsive Design

**Breakpoints:**
- Mobile: Default (< 768px)
- Tablet: md: (768px+)
- Desktop: lg: (1024px+)
- Large: xl: (1280px+)

**Mobile-First Patterns:**
- Stack vertically, expand horizontally on larger screens
- Touch targets minimum 44px
- Generous padding on mobile
- Collapsible navigation
- Bottom sheet modals on mobile, centered on desktop

---

## Accessibility

**Contrast Ratios:**
- Body text: Minimum 4.5:1
- Large text (18px+): Minimum 3:1
- Interactive elements: Minimum 3:1

**Focus States:**
- Visible focus ring: `ring-2 ring-primary ring-offset-2`
- Never remove focus outlines
- Keyboard navigation fully supported

**Screen Readers:**
- Semantic HTML (nav, main, article, section)
- ARIA labels on interactive icons
- Alt text on images
- Skip to content link

---

## Best Practices

1. **White Space**: Let content breathe - generous padding everywhere
2. **Consistency**: Use the design system - don't create one-off styles
3. **Hierarchy**: Clear visual hierarchy through size, weight, color
4. **Performance**: Optimize images, lazy load, minimize animations
5. **Touch Friendly**: Minimum 44x44px touch targets
6. **Loading States**: Always show feedback during async operations
7. **Error States**: Clear, helpful error messages with recovery actions
8. **Empty States**: Encouraging messages with clear CTAs

---

## Design Inspiration

**Reference Apps:**
- YouVersion Bible (navigation, cards, typography)
- Headspace (calm, peaceful interactions)
- Notion (clean content organization)
- Instagram (engaging card layouts)

**Design Goals:**
- Feel premium like a paid app
- Inspire trust and peace
- Delight users with smooth interactions
- Honor the sacred nature of testimonies
- Encourage community engagement

---

**Remember:** Every pixel should serve the mission of creating a beautiful, peaceful space where believers share and strengthen their faith.
