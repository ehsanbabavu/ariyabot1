# Overview

This is a modern Persian e-commerce and support web application built with a full-stack TypeScript architecture. The application provides user management, a ticketing system, inventory management, and subscription services with role-based access control. All user-facing content is displayed in Persian (Farsi) while maintaining a modern, responsive design. The project aims to provide a comprehensive and intuitive platform for online business operations in the Persian market.

# Recent Changes

## October 03, 2025 (Late Night)
- **Card Number Extraction Enhancement**: Modified Gemini Vision AI prompt to extract source card number instead of bank name for deposit receipts
- **Structured Field Mapping**: Updated `accountSource` field extraction to capture the 16-digit card number from "از کارت" or "مبدا" section
- **WhatsApp File Type Handling**: Fixed critical bug where file-type messages (images) were not being processed - now properly detects `type: 'file'` and uses `mediaUrl` field
- **Message Content Prioritization**: Enhanced message processing logic to check message type first (file vs chat), then extract appropriate content field
- **Image URL Storage**: Added `imageUrl` field to receivedMessages table schema to persist image URLs for future reference and auditing
- **Dual Processing Path**: Implemented separate handling for file messages (use mediaUrl) vs text messages (use message field) in both user-specific and global token flows
- **Database Migration**: Extended receivedMessages schema with nullable `imageUrl` text field for storing receipt image URLs from WhatsiPlus

## October 03, 2025 (Late Evening)
- **WhatsApp Image Receipt Processing**: Implemented automatic image-based deposit receipt processing using Gemini Vision API for OCR
- **Image URL Detection**: Added extractImageUrl method to detect image links in WhatsApp messages (supports .jpg, .png, .jpeg, .gif, .bmp, .webp extensions and WhatsiPlus attachment URLs)
- **Image Download Pipeline**: Created downloadImage method that fetches images from URLs, converts to base64, and extracts MIME type for Vision API processing
- **Gemini Vision Integration**: Implemented extractDepositInfoFromImage method that sends receipt images to Gemini 2.0 Flash Vision model for intelligent data extraction
- **Smart Processing Priority**: Updated handleAutoResponse to prioritize image receipts first, then text receipts, then normal AI responses for optimal user experience
- **Unified Workflow**: Image receipts follow same validation, duplicate detection, and notification flow as text receipts (handleDepositImageMessage mirrors handleDepositMessage logic)
- **Comprehensive Logging**: Added telemetry logging for image processing including download status, Gemini Vision responses, and extraction results
- **Error Resilience**: Implemented defensive error handling with graceful fallbacks if image download fails or Vision API returns incomplete data

## October 03, 2025 (Evening)
- **Duplicate Transaction Prevention**: Implemented comprehensive duplicate transaction detection system based on referenceId to prevent users from submitting the same bank receipt multiple times
- **Smart Duplicate Detection**: Added getTransactionByReferenceId method to storage layer (both MemStorage and DbStorage) for efficient duplicate checking
- **WhatsApp Duplicate Warning**: Created automatic WhatsApp warning message system that notifies users when they attempt to submit a duplicate transaction with the same reference number
- **Transaction Status Notifications**: Implemented automatic WhatsApp notifications for transaction status changes in admin/level1 panel
- **Approval Messaging**: Added sendTransactionApprovedMessage method that sends success confirmation to users when their transaction is marked as completed
- **Rejection Messaging**: Added sendTransactionRejectedMessage method that sends rejection notice to users when their transaction is marked as failed
- **API Enhancement**: Extended PUT /api/transactions/:id/status endpoint to automatically trigger WhatsApp notifications based on status changes
- **User Communication Flow**: Complete notification cycle - initial receipt confirmation, duplicate warnings, and final approval/rejection messages all sent via WhatsApp

## October 03, 2025 (Morning)
- **WhatsApp Deposit Receipt Processing**: Implemented automatic deposit receipt processing via WhatsApp using Gemini AI
- **AI-Powered Financial Data Extraction**: Added intelligent extraction of deposit information including amount, transaction date, time, reference ID, account source, and payment method
- **Mandatory Field Validation**: Enforced strict validation requiring amount, referenceId, and transactionDate before persisting transactions to prevent incomplete records
- **Smart Clarification Messaging**: Implemented dynamic clarification request system that enumerates all missing fields when extraction is incomplete
- **Structured Telemetry Logging**: Added comprehensive JSON logging for all extraction attempts with full message context for monitoring and debugging
- **Automatic Confirmation Flow**: Created automatic confirmation messaging system that sends Persian thank-you messages to users after successful deposit detection
- **Deposit Detection**: Enhanced WhatsApp auto-response with intelligent deposit message detection using pattern matching and AI classification
- **Service Layer Architecture**: Extended gemini-service.ts with two new methods (isDepositMessage, extractDepositInfo) and whatsapp-service.ts with three new methods (handleDepositMessage, sendDepositClarificationMessage, sendDepositConfirmationMessage)

## September 26, 2025 (Evening)
- **Compact Transaction Management**: Completely redesigned transactions page from large table format to compact card layout
- **Space Efficient Design**: Replaced bulky stats cards with condensed horizontal cards for better space utilization
- **Streamlined Filters**: Transformed filter panel from full-width card to compact horizontal filter bar with inline controls
- **Improved Mobile Experience**: Card-based layout provides better responsiveness and readability on smaller screens
- **Code Cleanup**: Removed unused Table components and imports to maintain clean codebase
- **User Interface Enhancement**: Maintained all functionality while reducing vertical space usage by ~60%

## September 26, 2025 (Morning)
- **Transaction Status Update Bug Fix**: Fixed critical bug in transaction status change functionality for level 1 users
- **API Request Parameter Order**: Corrected parameter order in apiRequest calls for successful-transactions.tsx
- **Status Change Dialog**: Resolved issue where status update requests were failing due to incorrect API call structure
- **User Experience Enhancement**: Transaction status changes now work properly with appropriate success/error toasts and cache invalidation

## September 24, 2025
- **Unread Messages Badge System**: Implemented comprehensive unread message notification system for internal chat functionality
- **API Endpoint Enhancement**: Added new `/api/internal-chats/unread-count` endpoint that returns count of unread messages for current user based on role
- **Automatic Message Reading**: Enhanced chat pages to automatically mark all messages as read when users enter the chat interface using mark-all-read endpoint
- **Sidebar Badge Integration**: Added red notification badges to sidebar chat menu items showing unread message counts with real-time updates
- **Role-Based Badge Display**: Implemented badges for both user roles - "چت با فروشنده" for user_level_2 and "چت با مشتریان" for user_level_1 users
- **Real-Time Polling**: Configured 5-second interval polling to keep unread counts updated automatically without manual refresh
- **TypeScript Integration**: Properly typed API responses and React Query integration for type-safe data handling

## September 23, 2025 (Continued)
- **Orders Enhancement for Level 1 Users**: Completely redesigned received orders system with customer names and addresses instead of codes
- **List View Implementation**: Converted received orders display to list format with improved card layout for better readability
- **Notification Bell System**: Implemented dynamic notification bell for level 1 users with 30-second auto-refresh for new orders (pending status)
- **Dashboard Enhancement**: Added unshipped orders dashboard card for level 1 users showing count of orders that need shipping (pending, confirmed, preparing)
- **API Improvements**: Enhanced backend with proper JOIN queries to display customer information and new endpoints for notifications and dashboard stats
- **Role-Based Features**: All new features properly restricted to user_level_1 only, with proper authentication and access control

## October 03, 2025 (Replit Import)
- **Fresh GitHub Import Setup**: Successfully configured fresh GitHub clone for Replit environment
- **Development Workflow**: Configured development workflow with proper port 5000 and webview output type
- **Host Configuration**: Verified Vite configuration has `allowedHosts: true` for Replit proxy compatibility  
- **Deployment Configuration**: Set up autoscale deployment with build and start commands
- **Application Status**: Application running successfully with Persian login interface rendering correctly
- **Server Configuration**: Express backend serving on 0.0.0.0:5000 with Vite middleware integration
- **Database Setup**: PostgreSQL database provisioned and schema pushed successfully using drizzle-kit
- **Test Data**: Confirmed automatic test data creation (admin: ehsan/admin123, seller: test_seller/test123)
- **Build Process**: Verified production build process works correctly (vite build + esbuild)
- **Environment Variables**: DATABASE_URL configured, JWT_SECRET uses dev default (should set for production)
- **Security**: JWT authentication uses fixed dev secret in development, requires JWT_SECRET env var for production deployment
- **WhatsApp Service**: WhatsApp messaging service initialized and running (requires token configuration)

## September 20, 2025
- **Persian Invoice Template**: Completely redesigned invoice/receipt system based on traditional Persian business invoice format
- **Invoice Format Standards**: Implemented official Persian invoice layout with "فاکتور فروش" header, customer details section "مشخصات خریدار", and structured item table
- **Currency Display**: Added Rial currency display throughout invoice system (converted from Toman) with proper Persian number formatting
- **Number to Words Conversion**: Implemented Persian number-to-words conversion with proper conjunction "و" for invoice totals
- **Standardized Table Layout**: Fixed invoice table to exactly 5 rows as per business standards, with automatic padding for orders with fewer items
- **Professional Invoice Elements**: Added all required business invoice sections including "جمع کل به حروف" (total in words) and "مهر و امضاء فروشنده" (seller signature/seal area)

## September 19, 2025
- **Auto-sliding Product Carousel**: Implemented smooth auto-scrolling for best-selling products in user dashboard using useRef, useEffect, and useMemo with 3-second intervals
- **Sidebar Menu Restructuring**: Removed "my services" submenu and moved addresses, orders, and financial sections directly to main menu for user_level_2
- **UI/UX Improvements**: Hidden inventory section from user_level_2 navigation and moved tickets section to bottom of menu
- **Orders Enhancement**: Re-added payment button to orders page in operations section for pending/confirmed orders
- **Address Selection System**: Implemented comprehensive address selection in shopping cart with ability to add new addresses, including validation and API integration

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

## Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **File Uploads**: Multer middleware
- **Authentication**: JWT-based with bcrypt for password hashing
- **Middleware**: Custom authentication and request logging

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
- **Key Tables**: Users, Tickets, Products, Subscriptions, WhatsApp Settings

## Component Architecture
- **Layout System**: Reusable dashboard layout with sidebar
- **Form Components**: Custom Persian input components with RTL support
- **UI Components**: shadcn/ui integration
- **Authentication Guards**: Higher-order components for route protection

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

## Database and Storage
- **Database Provider**: Neon Database
- **Migration Tools**: Drizzle Kit

## Development Tools
- **Type Safety**: TypeScript
- **Code Quality**: ESLint
- **Development Server**: Vite dev server
- **Replit Integration**: Custom Replit plugins