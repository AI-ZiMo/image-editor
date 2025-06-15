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

# Type checking (no direct command - use editor/IDE)
# Note: This project does not have a separate typecheck script configured
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

#### AI Service Layer (`lib/ai-service.ts`) - CRITICAL ARCHITECTURE
The application supports two AI providers through a unified service interface:
- **Tuzi AI**: Synchronous, faster processing (recommended for production)
  - Returns image URL immediately in `predictionId` field
  - Triggers background storage via `storeImageInBackground()`
  - For new images: Creates new project using `create_new_project` RPC
  - For edits: Adds to existing project using `add_generated_image` RPC with `parentId`
- **Replicate**: Asynchronous with polling, slower but reliable
  - Returns prediction ID for status polling via `/api/check-prediction`
  - Frontend polls until completion, then calls `save-image-history` with `projectId` and `parentId`
- **Provider switching**: Change `PROVIDER` env var and restart dev server
- **Model switching**: Change `MODEL` env var and restart dev server
- **Important**: Changing AI provider/model requires server restart to take effect

#### Database Structure
Database is set up through SQL scripts in `sqls/` directory (execute in order):
1. `01_credits_table.sql` - User credits system
2. `02_history_table.sql` - Image history with project-based organization
3. `03_functions.sql` - Database functions for business logic
4. `04_storage_setup.sql` - Supabase storage configuration
5. `05_payment_table.sql` - Payment system integration

#### Key Features
- **Project-based Image Organization**: Each uploaded original image creates a project; AI edits form a chain within that project
- **Credit System**: Users get 2 credits on signup, 1 credit per image generation
- **Multi-provider AI**: Seamless switching between AI providers via environment variables
- **Dual Processing Modes**: Synchronous (Tuzi AI) vs Asynchronous (Replicate) image generation
- **Iterative Editing**: Each AI edit uses the latest image in the project as input for the next edit
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
- `/api/edit-image` - Main image editing endpoint with credit deduction
- `/api/check-prediction` - Status checking for async providers (Replicate)
- `/api/store-generated-image` - Downloads and stores AI-generated images to Supabase
- `/api/save-image-history` - Creates new projects for generated images or adds to existing
- `/api/upload-image` - User image upload and project creation
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
- Uses Turbopack for faster development builds (`pnpm dev`)
- ESLint errors are ignored during builds (production setting)
- Images are configured for multiple CDN hostnames
- Row Level Security (RLS) enabled on all database tables
- Service functions use `SECURITY DEFINER` for proper permissions
- Credit system enforces non-negative balance with database constraints
- **No test framework configured** - tests must be added manually if needed
- **Environment changes require server restart** - especially AI provider/model changes

### Development Workflow Notes
- When switching AI providers: Change `PROVIDER` in `.env.local` → restart dev server
- When adding new API routes: Follow the existing pattern in `app/api/`
- Database changes: Add new SQL files to `sqls/` directory with incremental numbering
- Component development: Use existing Shadcn/ui components from `components/ui/`

## IMPORTANT: Project-Specific Instructions

### Critical Context
This is **小猫AI图片编辑** - a PhotoShop alternative using AI for image editing. The core functionality revolves around:
1. **AI-powered image editing** through text prompts
2. **Multi-provider AI support** (Tuzi AI vs Replicate)
3. **Credit-based usage system**
4. **Project-based image organization**

### When Working on Code
- **Always check current AI provider setup** before debugging image generation issues
- **Consider credit implications** when modifying image generation logic
- **Test with both AI providers** if making changes to the AI service layer
- **Remember image generation flow**: 
  - **Upload Original**: Original Image → Upload → Create New Project (with `isOriginal: true`)
  - **Tuzi AI (同步)**: Latest Image → Edit → Immediate Result → Background Storage → Add to Existing Project
  - **Replicate (异步)**: Latest Image → Edit → Prediction ID → Poll Status → Storage → Add to Existing Project
- **Key insight**: AI编辑基于项目中最新图片，形成编辑历史链 (parentId链式关系)
- **重要Bug修复**: Tuzi AI同步模式之前总是创建新项目，现在已修复为正确添加到现有项目