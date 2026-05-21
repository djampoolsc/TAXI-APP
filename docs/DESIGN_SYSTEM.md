# Design System: Axiom Perú - AI/UX Pro Max

**Generated with AI/UX Pro Max Skill**  
**Date:** May 21, 2026  
**Status:** Complete  

---

## 🎨 Global Design System

### Brand Colors

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | Amber/Gold | #F59E0B | Trust, CTA buttons, highlights |
| **Secondary** | Purple | #8B5CF6 | Technology, borders, accents |
| **Location** | Green | #059669 | Maps, GPS, location features |
| **Action** | Orange | #F97316 | Mobile CTA, alerts |
| **Background** | Slate 950 | #0F172A | Dark backgrounds |
| **Text** | Slate 50 | #F8FAFC | Primary text |
| **Text Muted** | Slate 400 | #94A3B8 | Secondary text |
| **Border** | Slate 700 | #374151 | Dividers, borders |

### Typography

**Web & Admin:**
- **Font Family:** IBM Plex Sans
- **Mood:** Financial, trustworthy, professional
- **Weight Range:** 300-700

**Mobile:**
- **Font Family:** Cinzel / Josefin Sans
- **Mood:** Luxury, elegant, premium
- **Weight Range:** 300-700

### Styles Implemented

#### 1. **Web App - Glassmorphism**
- Frosted glass cards with backdrop blur (10-20px)
- Subtle borders (1px solid rgba white 0.1)
- Layered depth effects
- Gradient backgrounds (slate 950 → slate 900)
- Smooth transitions (150-300ms)

```css
.glass-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(248, 250, 252, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
  color: #0f172a;
  font-weight: 600;
}
```

#### 2. **Admin Dashboard - Dark Mode OLED**
- High contrast for reduced eye strain
- Location green (#059669) for maps
- Action orange (#F97316) for alerts
- Minimal glow effects (text-shadow)
- WCAG AAA accessibility

#### 3. **Mobile App - Dark Mode (OLED)**
- Green for location/GPS features
- Orange for action CTAs
- High readability at night
- Power-efficient design
- Large touch targets (44x44px minimum)

---

## 🏗️ Component Library

### Buttons

**Primary Button (Web)**
```jsx
className="btn-primary px-6 py-3 rounded-lg hover:shadow-lg disabled:opacity-50"
```
- Background: Gold gradient
- Dark text for contrast
- Hover: Transform + shadow
- Disabled: 50% opacity

**Secondary Button (Web)**
```jsx
className="btn-secondary px-6 py-3 rounded-lg hover:opacity-80"
```
- Background: Transparent purple tint
- Purple border + text
- Hover: Increased opacity

### Cards

**Glass Card**
```jsx
className="glass-card rounded-2xl p-6 border border-slate-700/50"
```
- Frosted glass effect
- Rounded corners (16px)
- Subtle border
- Shadow effect

### Forms

**Input Fields**
```jsx
className="glass-input px-4 py-3 rounded-lg text-slate-100 focus:border-amber-400"
```
- Dark background (rgba slate)
- Light text
- Focus: Gold border + glow

### Tables

**Dashboard Table**
- Header: Dark background with gradient
- Rows: Alternating hover states
- Status badges with color coding
- Striped dividers

---

## 📱 Responsive Breakpoints

| Breakpoint | Size | Example Device |
|-----------|------|-----------------|
| Mobile | 375px | iPhone SE |
| Tablet | 768px | iPad |
| Laptop | 1024px | MacBook Air |
| Desktop | 1440px | 27" Monitor |

---

## ♿ Accessibility Checklist

### CRITICAL (Priority 1)
- ✅ Color contrast: 4.5:1 minimum for text
- ✅ Focus states: Visible focus rings (gold border)
- ✅ Alt text: All images with descriptive text
- ✅ Keyboard navigation: Tab order matches visual order
- ✅ Touch targets: Minimum 44x44px

### HIGH (Priority 2)
- ✅ Error messages: Clear, near problem field
- ✅ Loading states: Skeleton or spinner visible
- ✅ Form labels: Associated with inputs
- ✅ ARIA labels: Icon-only buttons have aria-label

### MEDIUM (Priority 3)
- ✅ Animations: prefers-reduced-motion respected
- ✅ Hover feedback: Smooth transitions (150-300ms)
- ✅ Line height: 1.5-1.75 for body text
- ✅ Line length: Limited to 65-75 characters

---

## 🎯 Anti-Patterns (AVOID)

| ❌ Don't | ✅ Do |
|----------|------|
| Use emoji as icons | Use SVG icons (Heroicons/Lucide) |
| Light backgrounds (web) | Dark backgrounds with high contrast |
| No security indicators | Show verified badges, locks |
| Instant state changes | Smooth transitions (150-300ms) |
| Different icon sets | Consistent icon library |
| Layout shifts on load | Reserved space for async content |
| Very slow animations | 150-300ms micro-interactions |

---

## 🎬 Animations & Effects

### Transitions
- **Default:** 150ms ease-out
- **Slow:** 300ms ease-out (important changes)
- **Fast:** 100ms ease-out (hover states)

### Loading States
- Spinner animation: 2s rotation
- Skeleton screens: Pulsing effect
- Progress bars: Linear animation

### Hover Effects (Web)
- Button: Transform -2px + shadow
- Card: Shadow increase + opacity
- Text: Color change to gold

---

## 🌙 Dark Mode (Mobile & Admin)

**Palette:**
- Background: #000000 (pure black for OLED)
- Card: #1A1A1A (10% white)
- Border: #333333 (20% white)
- Text: #FFFFFF (100% white)
- Text Muted: #999999 (60% white)

**Why Dark?**
- OLED efficiency (saves battery)
- Eye comfort at night
- Modern aesthetic
- Premium feel

---

## 📊 Color Usage by Feature

| Feature | Colors | Purpose |
|---------|--------|---------|
| **Rides** | Green + Orange | Location + action |
| **Emergency** | Red + Yellow | Alert status |
| **Success** | Green | Confirmed action |
| **Error** | Red | Problem indicator |
| **Warning** | Yellow | Caution needed |
| **Info** | Blue | Informational |

---

## 🚀 Implementation Guide

### Web App
```bash
# Already applied:
# - Glassmorphism style
# - IBM Plex Sans typography
# - Gold + Purple color scheme
# - Glass card components
# - Responsive layout

# To implement:
npm run dev  # See styles live
```

### Mobile App (Flutter)
```dart
// Colors
const primary = Color(0xFF059669);  // Green
const action = Color(0xFFF97316);   // Orange
const background = Color(0xFF000000);

// Typography
const heading = TextStyle(fontFamily: 'Cinzel');
const body = TextStyle(fontFamily: 'JosefinSans');
```

### Admin Dashboard
```tsx
// Already applied:
// - Dark OLED theme
// - High contrast colors
// - Status badges
// - Glassmorphic cards
```

---

## 📋 Pre-Delivery Checklist

Before releasing any UI component:

- [ ] No emojis as icons → Use SVG icons
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Text contrast ≥ 4.5:1
- [ ] Focus states visible for keyboard nav
- [ ] `prefers-reduced-motion` respected
- [ ] Tested at 375px, 768px, 1024px, 1440px
- [ ] All images have alt text
- [ ] Form labels associated with inputs
- [ ] Touch targets ≥ 44x44px (mobile)
- [ ] Loading states clearly visible
- [ ] Error messages near problem field
- [ ] Tested in light + dark modes

---

## 📚 Resources

### Design Tools
- **Figma:** [Design System File]
- **UI Kit:** Glassmorphism components ready
- **Icons:** Heroicons (web) + Lucide (mobile)

### Documentation
- **WCAG 2.1:** Level AA (target)
- **Mobile:** iOS 14+ / Android 11+
- **Browser Support:** Chrome, Safari, Firefox (latest 2 versions)

---

## 👥 Design System Maintenance

**Last Updated:** May 21, 2026  
**Maintained By:** Design Team  
**Next Review:** June 21, 2026  

### Version History
- v1.0 (May 21, 2026): Initial release with Glassmorphism (web) + Dark Mode (mobile/admin)

---

**Generated by AI/UX Pro Max**  
*67 styles × 96+ palettes × 57 font pairings = Professional Design System*
