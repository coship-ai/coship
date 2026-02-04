# CoShip Landing Page

CoShip is a landing page for an Agentic Co-founder product that helps non-technical founders build MVPs using Claude.

## Tech Stack

- **Framework**: Astro 5
- **Styling**: Tailwind CSS v4 (CSS-first configuration)
- **Fonts**: Clash Display (headings), Satoshi (body) - stored in `public/fonts/`

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── components/
│   ├── icons/        # SVG icon components (ShipLogo)
│   ├── layout/       # Header, Footer
│   ├── sections/     # Page sections (Hero, Process, Comparison, FAQ, Pricing)
│   └── ui/           # Reusable UI components (Button, Card, Container)
├── layouts/          # BaseLayout with meta tags
├── pages/            # Page routes (index.astro)
└── styles/           # global.css with Tailwind theme
```

## Theme Configuration

The theme is configured in `src/styles/global.css` using Tailwind v4's `@theme` directive:

- **Colors**: Ocean blue palette (`ocean-50` to `ocean-950`), dark backgrounds (`dark-600` to `dark-950`)
- **Fonts**: `--font-display` (Clash Display), `--font-body` (Satoshi)
- **Animations**: `sail-sway`, `wave-flow`, `float`, `shimmer`

## Component Patterns

- **Button**: Supports `variant` (primary/secondary/ghost) and `size` (sm/md/lg) props
- **Card**: Supports `variant` (default/elevated/glow) prop
- **Container**: Supports `size` (sm/md/lg/full) prop

## Key Sections

1. **Hero**: Main CTA with ship logo, "Powered by Claude" badge
2. **Process**: 6-step workflow (Matching, Define, Scope, Build, Review, Ship) with stacked scroll cards
3. **Comparison**: Table comparing CoShip vs Technical Co-founder vs Fractional CTO vs Vibe Coding
4. **FAQ**: Accordion with 7 questions about Claude and the product
5. **Pricing**: $899 lifetime / $125 monthly / $1,249 yearly
