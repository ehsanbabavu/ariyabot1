# Overview

This project is a modern, full-stack TypeScript Persian e-commerce and support web application. It offers comprehensive features including user management, a ticketing system, inventory, and subscription services with role-based access control. The platform is designed for the Persian market, featuring a fully localized Farsi UI, responsive design, and AI-powered functionalities like smart ordering and WhatsApp-based deposit receipt processing. The ambition is to provide an intuitive and powerful online business tool, enhancing user experience through advanced AI and robust system architecture.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## UI/UX Decisions
- **Frontend**: React 18 with TypeScript and Vite.
- **Components & Styling**: shadcn/ui (Radix UI-based) and Tailwind CSS, with Vazirmatn font for Persian script and RTL support.
- **Responsiveness**: Mobile-first design featuring a hamburger menu and drawer for mobile navigation, and a fixed sidebar for desktop.
- **Design Elements**: Compact card layouts, auto-sliding carousels, dynamic notifications, and Persian invoice templates with currency conversion.

## Technical Implementations
- **Backend**: Node.js with Express.js, TypeScript, and ES modules.
- **API**: RESTful, JSON-based.
- **Authentication**: JWT with bcrypt hashing and role-based access control (admin, user_level_1, user_level_2).
- **File Management**: Multer for uploads, local storage for images, Puppeteer for HTML-to-image invoice generation.
- **Data Storage**: PostgreSQL with Drizzle ORM, Neon Database for serverless hosting, Drizzle Kit for migrations, and connect-pg-simple for session storage.

## Feature Specifications
- **WhatsApp Integration**: AI-powered OCR for deposit receipts (Gemini Vision), smart product ordering, duplicate transaction detection, automated notifications, and invoice delivery. Includes an intelligent, rate-limited queue system (3 messages/sec per user) with retries to prevent API blocking.
- **Internal Chat**: Real-time unread message badges with role-based visibility.
- **Order Management**: Enhanced order display for sellers, new order notifications, unshipped orders dashboard, and automatic invoice generation.
- **Transaction Management**: Duplicate transaction detection and automated WhatsApp notifications for approval/rejection.
- **Shipping Management**: Configurable shipping methods (Pishaz, Ordinary, Courier, Free) for sellers, with buyer selection during checkout.
- **VAT Management**: Seller-configurable Value Added Tax (VAT) with customizable percentage, enable/disable toggle, and invoice thank you message. VAT calculation is integrated into order totals and displayed separately on invoices.
- **Password Reset**: Secure OTP-based recovery via WhatsApp with rate limiting.
- **Cart Page Redesign**: Responsive two-column layout showing product details on the right and order summary, delivery, and shipping options on the left.
- **Automatic Order Processing**: Upon deposit transaction approval, the system automatically processes pending orders chronologically, confirming them, deducting payment, and updating balances until funds are insufficient.
- **Database Backup & Restore**: Complete database backup and restore system for admin users with:
  - Full PostgreSQL backup creation using pg_dump with automatic download
  - Restore from SQL backup files with psql
  - List of saved backups with file size and creation date
  - Download individual backup files
  - Delete old backup files
  - Path traversal protection with filename validation and directory containment checks
  - Admin-only access with JWT authentication
  - Persian UI accessible at /database-backup in admin settings menu

## System Design Choices
- **AI Architecture**: Dual AI provider system supporting Gemini AI (Google) and Liara AI (OpenAI-compatible) with an AI Service Orchestrator for centralized management and automatic failover. Only one provider is active at a time, configurable via admin settings.
- **Development & Deployment**: Vite for frontend bundling and development server; Express serves static assets in production. Configured for VM deployment.
- **Security**: JWT_SECRET and ADMIN_PASSWORD managed via Replit Secrets.

# External Dependencies

## Core Frameworks
- React 18, React Hook Form, TanStack Query, Wouter, Vite.

## UI & Styling
- Radix UI, shadcn/ui, Tailwind CSS, PostCSS, Lucide React, Google Fonts.

## Backend Services
- Express.js, Drizzle ORM, Multer, jsonwebtoken, bcrypt, Puppeteer.

## AI Services
- **Gemini AI**: For OCR and natural language processing.
- **Liara AI**: OpenAI-compatible alternative AI provider.

## Database & Storage
- Neon Database (PostgreSQL), Drizzle Kit.

# Replit Setup & Configuration

## Initial Setup (Completed)
- **Date**: October 24, 2025
- **Status**: ✅ Successfully imported and configured in Replit environment
- **Setup Actions**:
  - Installed all npm dependencies
  - Provisioned PostgreSQL database
  - Pushed database schema using Drizzle Kit
  - Created admin and test user accounts
  - Initialized test data (categories, products)
  - Configured development workflow
  - Set up VM deployment configuration

## Environment Configuration
1. **Database**: PostgreSQL database is provisioned and connected via `DATABASE_URL`
2. **Schema**: Database schema pushed successfully using Drizzle Kit (`node ./node_modules/drizzle-kit/bin.cjs push --force`)
3. **Port**: Server runs on port 5000 (both dev and production)
4. **Host**: 0.0.0.0 (configured for Replit proxy support with allowedHosts: true)

## Default Credentials
- **Admin User**: 
  - Username: `ehsan`
  - Password: `admin123` (change via `ADMIN_PASSWORD` environment variable)
- **Test Seller**:
  - Username: `test_seller`
  - Password: `test123`

## Required Environment Variables (Optional)
The following environment variables can be set for enhanced functionality:
- `JWT_SECRET`: Custom JWT secret (defaults to dev secret if not set)
- `ADMIN_PASSWORD`: Custom admin password (defaults to admin123)
- `GEMINI_API_KEY`: For AI-powered features (OCR, smart ordering)
- `LIARA_AI_API_KEY`: Alternative AI provider
- WhatsApp integration tokens (configured per user in admin panel)

## Development Workflow
- **Start Dev Server**: `npm run dev` (automatically configured)
- **Database Push**: `npm run db:push`
- **Type Check**: `npm run check`
- **Build**: `npm run build`

## Deployment
- **Type**: VM (always-on server)
- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **Configuration**: Already set up and ready to publish

## Test Data
The application automatically creates:
- Admin and test seller accounts
- 3 mobile phone categories
- 6 sample products

All ready for testing and demonstration purposes.