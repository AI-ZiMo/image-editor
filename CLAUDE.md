# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## Project Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Services**: Dual provider support (Tuzi AI and Replicate)
- **Package Manager**: pnpm

### Core Architecture

#### AI Service Layer (`lib/ai-service.ts`)
The application supports two AI providers through a unified service interface:
- **Tuzi AI**: Synchronous, faster processing (recommended for production)
- **Replicate**: Asynchronous with polling, slower but reliable
- Provider selection controlled by `PROVIDER` environment variable
- Model selection controlled by `MODEL` environment variable

#### Database Structure
Database is set up through SQL scripts in `sqls/` directory (execute in order):
1. `01_credits_table.sql` - User credits system
2. `02_history_table.sql` - Image history with project-based organization
3. `03_functions.sql` - Database functions for business logic
4. `04_storage_setup.sql` - Supabase storage configuration
5. `05_payment_table.sql` - Payment system integration

#### Key Features
- **Project-based Image Organization**: Each original image creates a project, edits form branches
- **Credit System**: Users get 2 credits on signup, 1 credit per image generation
- **Multi-provider AI**: Seamless switching between AI providers via environment variables
- **Authentication**: Full auth flow with email confirmation
- **Payment Integration**: ZPay integration for credit purchases

### Environment Configuration

Required environment variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Provider Selection
PROVIDER=tuzi  # or "replicate"
MODEL=flux-kontext-pro  # or "flux-kontext-max"

# Provider-specific keys (based on PROVIDER selection)
TUZI_API_KEY=  # if PROVIDER=tuzi
REPLICATE_API_TOKEN=  # if PROVIDER=replicate

# Optional
ZPAY_PID=  # for payments
ZPAY_KEY=  # for payments
NEXT_PUBLIC_SITE_URL=
```

### API Routes Structure
- `/api/edit-image` - Main image editing endpoint
- `/api/check-prediction` - Status checking for async providers
- `/api/upload-image` - Image upload and project creation
- `/api/user-credits` - Credit management
- `/api/user-history` - User's image history
- `/api/payment/` - Payment flow endpoints

### Component Architecture
- `components/ui/` - Shadcn/ui base components
- `components/` - Application-specific components
- `app/` - Next.js App Router pages and API routes
- Authentication pages in `app/(auth)/`
- Protected pages in `app/protected/`

### Key Development Notes
- Uses Turbopack for faster development builds
- ESLint errors are ignored during builds (production setting)
- Images are configured for multiple CDN hostnames
- Row Level Security (RLS) enabled on all database tables
- Service functions use `SECURITY DEFINER` for proper permissions
- Credit system enforces non-negative balance with database constraints