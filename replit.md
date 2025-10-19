# Overview

This is a modern Persian e-commerce and support web application built with a full-stack TypeScript architecture. The application provides user management, a ticketing system, inventory management, and subscription services with role-based access control. All user-facing content is displayed in Persian (Farsi) while maintaining a modern, responsive design. The project aims to provide a comprehensive and intuitive platform for online business operations in the Persian market, incorporating AI-powered features for smart ordering and deposit receipt processing via WhatsApp.

# Recent Changes

## Dual AI Provider System (October 19, 2025)
- ✅ Implemented dual AI provider architecture supporting both Gemini AI and Liara AI
- ✅ Created AI Service Orchestrator (`ai-service.ts`) for centralized provider management and automatic failover
- ✅ Added Liara AI service (`liara-service.ts`) using OpenAI-compatible API
- ✅ Updated database schema with unique constraint on `provider` column in `ai_token_settings` table
- ✅ Enhanced storage layer with provider-specific methods:
  - `getAiTokenSettings(provider?)`: Retrieve settings for specific provider or active provider
  - `getAllAiTokenSettings()`: Retrieve all provider configurations
  - Updated both MemStorage and DbStorage implementations
- ✅ Redesigned admin AI token settings page (`/admin/ai-token`) with tabbed interface for Gemini and Liara
- ✅ Implemented mutual exclusivity: activating one provider automatically deactivates the other
- ✅ Updated all API routes to use AI orchestrator instead of direct Gemini service calls
- ✅ Provider preference: Gemini AI is preferred when both are active, with automatic fallback to Liara
- ✅ Fixed provider-specific initialization in both AI services

## Replit Setup (Fresh GitHub Clone - October 19, 2025)

This project has been successfully cloned from GitHub and configured to run in the Replit environment:

- **Database**: PostgreSQL database configured, schema pushed successfully via `npm run db:push`
- **Dependencies**: All npm packages installed successfully (638 packages in node_modules)
- **Development Server**: Running on port 5000 (http://0.0.0.0:5000) with Vite dev server
- **Default Users**: Automatically created on first run
  - Admin: username `ehsan`, password set via ADMIN_PASSWORD secret
  - Test Seller: username `test_seller`, password `test123`
- **Test Data**: Pre-loaded with 3 mobile categories and 6 test products
- **Deployment**: Configured for VM deployment with build (`npm run build`) and run (`npm start`) scripts
- **Vite Configuration**: Pre-configured with `allowedHosts: true` for Replit proxy compatibility
- **Workflow**: Single workflow "Server" running `npm run dev` on port 5000 with webview output
- **Application Status**: ✅ Running successfully with Persian RTL login page

### Setup Steps Completed (October 19, 2025 - Latest Setup)
1. ✅ Database created and configured (PostgreSQL database)
2. ✅ Required secrets configured (JWT_SECRET and ADMIN_PASSWORD)
3. ✅ All npm dependencies installed fresh (638 packages including puppeteer, drizzle, express, react, etc.)
4. ✅ Database schema pushed successfully using Drizzle ORM (`npm run db:push`)
5. ✅ Development workflow "Server" configured and running on port 5000 with webview output
6. ✅ Deployment settings configured for VM deployment type:
   - Build: `npm run build` (vite build + esbuild bundling)
   - Run: `npm start` (production mode with compiled dist/index.js)
7. ✅ Application verified with screenshot - Persian RTL login page displaying correctly
8. ✅ Import process completed successfully - application fully functional
9. ✅ **Codebase cleanup performed (October 19, 2025)**:
   - Removed duplicate UI component: `client/src/components/ui/sidebar.tsx` (unused shadcn sidebar)
   - Removed unnecessary documentation: `VPS-INSTALLATION-GUIDE.md` (not applicable for Replit)
   - Removed temporary files: `cookies.txt`
   - Cleaned up `attached_assets/` folder: removed 31 old screenshots and invoice images (~3.3MB saved)
   - Kept project documentation files: 4 AI prompt text files and 1 video file for reference
   - Final `attached_assets/` size reduced from 3.9MB to 664KB

### Important Security Notes
- **JWT_SECRET**: ✅ Configured via Replit Secrets for secure session management
- **ADMIN_PASSWORD**: ✅ Configured via Replit Secrets (admin username: "ehsan")
- **GEMINI_API_KEY**: Optional for AI-powered features (WhatsApp OCR, smart ordering) - configure in admin panel or via environment variable
- **WhatsApp Integration**: Configure WhatsApp token in admin settings for messaging features

### Environment Variables
- `DATABASE_URL`: ✅ Configured (postgresql://postgres:password@helium/heliumdb?sslmode=disable)
- `JWT_SECRET`: ✅ Configured via Replit Secrets
- `ADMIN_PASSWORD`: ✅ Configured via Replit Secrets
- `GEMINI_API_KEY`: ⚠️ Optional - Not set (AI features will be disabled until configured)

### Architecture Notes
- The application runs frontend and backend on the same port (5000) using Vite in development mode
- In production, Vite builds static assets to `dist/public/` and Express serves them
- Backend listens on `0.0.0.0:5000` for Replit compatibility
- Database sessions stored in PostgreSQL using connect-pg-simple
- File uploads stored in `uploads/` directory
- Invoice images generated in `public/invoices/` directory

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite
- **UI Components**: shadcn/ui built on Radix UI
- **Styling**: Tailwind CSS with Persian font support (Vazirmatn) and RTL layout
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form with Zod validation
- **UI/UX Decisions**: Compact card layouts for lists, auto-sliding carousels, dynamic notification bells, Persian invoice template adhering to business standards, and currency conversion/number-to-words for financial displays.

## Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **File Uploads**: Multer middleware
- **Authentication**: JWT-based with bcrypt for password hashing
- **Middleware**: Custom authentication and request logging
- **Invoice Generation**: Puppeteer-based HTML-to-image conversion for professional Persian invoices
- **Feature Specifications**:
    - **WhatsApp Integration**: AI-powered deposit receipt processing (OCR with Gemini Vision), smart product ordering with session management, duplicate transaction detection, automated user notifications for transaction status, and automatic invoice delivery via WhatsApp after order completion.
    - **Internal Chat**: Unread message badge system with real-time updates and role-based display.
    - **Order Management**: Enhanced order display for level 1 users with customer details, notification bell for new orders, unshipped orders dashboard, and automatic invoice generation with WhatsApp delivery upon order completion.
    - **Transaction Management**: Comprehensive duplicate transaction detection and automatic WhatsApp notifications for approval/rejection.
    - **Shipping Management**: Level 1 sellers can configure four shipping methods (پست پیشتاز, پست معمولی, پیک, ارسال رایگان) with enable/disable toggles and minimum amount for free shipping. Level 2 buyers select from enabled methods during web checkout and WhatsApp ordering. Shipping method is stored with each order for tracking and reporting.
    - **VAT Management (October 15, 2025)**: Level 1 sellers can configure Value Added Tax (ارزش افزوده) with customizable percentage rate (default 9%), enable/disable toggle, and customizable thank you message for invoices (default "از خرید شما متشکریم"). VAT is automatically calculated and applied to order totals during checkout and displayed separately in invoices (showing subtotal, VAT amount, and total). VAT settings page redesigned with modern Tabs UI for better organization. VAT settings are seller-specific and stored per userId.
    - **Password Reset System**: Secure OTP-based password recovery via WhatsApp with crypto.randomInt for secure 6-digit code generation, 5-minute expiration, one-time use validation, and rate limiting (3 attempts per 15 minutes per user).
    - **Cart Page Redesign (October 18, 2025)**: Shopping cart page redesigned with responsive two-column layout. Right column (lg:col-span-8, 2/3 width) displays products in table format with columns for image/name, unit price, quantity controls, total price, and delete action. Left column (lg:col-span-4, 1/3 width) shows order summary, delivery address selection, and shipping method options. Removed previous standalone "سبد خرید شما" card component. Layout uses lg:grid-cols-12 for responsive grid on large screens and stacks vertically on mobile.
    - **Automatic Order Processing (October 18, 2025)**: When level 1 users approve deposit transactions (change status to "completed"), the system automatically processes awaiting payment orders in chronological order (oldest first based on createdAt timestamp). For each pending order, the system checks if user's current balance is sufficient, then automatically: (1) confirms the order by changing status to "confirmed", (2) creates a negative order_payment transaction to deduct the order amount, (3) updates the running balance. Processing continues until balance is insufficient or no more pending orders remain. Implemented via getAwaitingPaymentOrdersByUser() method in storage layer with ORDER BY createdAt ASC.
    - **Security**: JWT authentication with role-based access control, secure password reset with OTP validation.

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon Database serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations
- **Session Storage**: Connect-pg-simple for PostgreSQL session storage
- **File Storage**: Local file system for uploaded images

## Authentication and Authorization
- **Authentication Method**: JWT tokens with localStorage persistence
- **Password Security**: bcrypt hashing
- **Role-Based Access Control**: Three user roles (admin, user_level_1, user_level_2)
- **Protected Routes**: Custom route components
- **Session Management**: Automatic token validation and renewal

## Database Schema Design
- **Key Tables**: Users, Tickets, Products, Subscriptions, WhatsApp Settings, Received Messages (with imageUrl for receipts).

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack Query
- **Build Tools**: Vite
- **Routing**: Wouter

## UI and Styling
- **Component Library**: Radix UI, shadcn/ui
- **Styling Framework**: Tailwind CSS, PostCSS
- **Icons**: Lucide React
- **Typography**: Google Fonts

## Backend Services
- **Web Framework**: Express.js
- **Database ORM**: Drizzle ORM
- **File Processing**: Multer
- **Authentication**: JWT, bcrypt
- **Invoice Generation**: Puppeteer (headless Chrome for HTML-to-image conversion)

## AI Services (Dual-Provider Architecture - October 19, 2025)
- **Dual AI System**: The application now supports two AI providers that can be configured independently:
  - **Gemini AI** (Google): For intelligent deposit receipt OCR (Gemini 2.0 Flash Vision) and natural language understanding for WhatsApp product ordering.
  - **Liara AI** (OpenAI-compatible): Alternative AI provider using OpenAI-compatible API with automatic failover support.
- **Provider Management**: 
  - Only one AI provider can be active at a time (mutual exclusivity enforced)
  - Admin can configure and switch between providers via `/admin/ai-token` settings page
  - Separate API tokens stored securely for each provider
  - Automatic initialization and runtime failover between providers
- **AI Orchestrator** (`ai-service.ts`): Central service that manages provider selection, automatic failover, and unified interface for all AI operations
- **Storage Layer**: Provider-specific token retrieval with `getAiTokenSettings(provider)` and `getAllAiTokenSettings()` methods in both MemStorage and DbStorage
- **Database Schema**: `ai_token_settings` table with unique constraint on `provider` column to prevent duplicate provider configurations

## Database and Storage
- **Database Provider**: Neon Database
- **Migration Tools**: Drizzle Kit

## Development Tools
- **Type Safety**: TypeScript
- **Code Quality**: ESLint
- **Development Server**: Vite dev server