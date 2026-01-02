# MonsterCo - Water Tank Cleaning Service Website

## Overview

This is a bilingual (Spanish) landing page and blog platform for MonsterCo, a professional water tank (tinaco) and cistern cleaning service based in Querétaro, Mexico. The application provides service information, pricing, contact forms, and a blog with SEO-friendly content about water maintenance tips.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (New York style)
- **State Management**: TanStack React Query for server state and caching
- **Build Tool**: Vite with custom plugins for Replit integration and meta image handling
- **Fonts**: Inter (body), Montserrat (headings), Passion One (brand)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **API Pattern**: RESTful endpoints under `/api/*`
- **Development**: tsx for TypeScript execution with hot module replacement via Vite middleware
- **Production**: esbuild bundles server code to CommonJS for deployment

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Connection**: Uses `pg` Pool for development server, `@neondatabase/serverless` for Vercel serverless functions
- **Schema**: Defined in `shared/schema.ts` with Drizzle-Zod integration for validation
- **Tables**: `users` (authentication ready), `blog_posts` (content management)

### Deployment Architecture
- **Primary**: Vercel with serverless functions in `/api` directory
- **Alternative**: Traditional Express server for Replit deployment
- **Static Assets**: Vite builds to `dist/public`, served by Express or Vercel

### Key Design Decisions

1. **Dual API Pattern**: The codebase maintains both Express routes (`server/routes.ts`) and Vercel serverless functions (`api/`) to support multiple deployment targets. The Vercel functions use Neon's HTTP driver for edge compatibility.

2. **Shared Schema**: Database schema and TypeScript types are centralized in `shared/schema.ts`, imported by both client and server, ensuring type safety across the stack.

3. **Component Architecture**: UI components follow shadcn/ui patterns with Radix primitives. Section components (`client/src/components/sections/`) compose the landing page, promoting reusability.

4. **Blog System**: Posts support Markdown content rendered via `react-markdown`. Admin interface at `/admin/blog` with simple password authentication (hardcoded for MVP).

## External Dependencies

### Database
- **PostgreSQL**: Required via `DATABASE_URL` environment variable
- **Neon Database**: Used for serverless Vercel deployments (`@neondatabase/serverless`)

### Third-Party Services
- **WhatsApp Business**: Contact integration via `wa.me` links (phone: +5214425016667)
- **Google Fonts**: Inter, Montserrat, Passion One loaded via CDN

### Key NPM Dependencies
- **UI**: `@radix-ui/*` primitives, `class-variance-authority`, `cmdk`, `embla-carousel-react`
- **Data**: `drizzle-orm`, `drizzle-zod`, `@tanstack/react-query`, `zod`
- **Server**: `express`, `express-session`, `connect-pg-simple`
- **Build**: `vite`, `esbuild`, `tailwindcss`

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required for both development and production)