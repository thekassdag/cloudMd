# CloudDocs Frontend

This is the frontend application for CloudDocs, a modern document collaboration platform.

## Technology Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context (`DocumentContext`, `AuthContext`)
- **Notifications**: Sonner (Toast notifications)

## Project Structure

```
src/
├── components/     # Reusable UI components
├── config/         # App configuration (API endpoints, etc.)
├── contexts/       # Global state (Documents, Auth)
├── layouts/        # Page layouts (AppLayout, AuthLayout)
├── pages/          # Main page views (Dashboard, Editor, etc.)
├── services/       # API integration layer (Mock data currently)
└── styles/         # Global styles and Tailwind directives
```

## Backend Integration Guide

This project is designed to be easily connected to a serverless backend (AWS Lambda + DynamoDB).

### 1. API Configuration

Define your API Base URL in `.env`:
```bash
VITE_API_URL=https://your-api-gateway-url.com/prod
```

### 2. Service Layer

The integration logic resides in `src/services/`. Currently, these services use mock data with simulated latency.

To connect to the real backend:
1. Go to `src/services/documentService.ts`, `authService.ts`, and `activityService.ts`.
2. Replace the mock return statements with actual HTTP requests (using `fetch` or `axios`).
3. Use the endpoints defined in `src/config/api.ts`.

Example `documentService` replacement:

```typescript
import { API_CONFIG } from '../config/api';

export const documentService = {
    getAll: async () => {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCUMENTS.LIST}`);
        return response.json();
    }
};
```

### 3. Authentication

`AuthContext` handles the user session.
- **Login**: When connecting to the backend, ensure `authService.login()` returns a JWT or session token.
- **Headers**: You may need to add an interceptor or helper to attach `Authorization: Bearer <token>` to requests in `src/services`.

## Deployment

This app is a static site (SPA) and can be hosted directly on **Amazon S3** (with CloudFront) or Vercel/Netlify.

### Build Implementation

To build for production:

```bash
npm run build
```

This will create a `dist/` directory containing the optimized static assets. Upload the contents of `dist/` to your S3 bucket.

## Development

Run the local development server:

```bash
npm run dev
```

## Features Implemented

### Core Features
- ✅ **Responsive Dashboard**: Adapts to mobile, tablet, and desktop
- ✅ **Document Management**: List/Grid view, Filter by type, Sort options
- ✅ **Rich Text Editor**: TipTap integration with formatting toolbar
- ✅ **Activity Feed**: Real-time activity tracking and display
- ✅ **Folder System**: Dynamic folder routing based on tags

### Authentication
- ✅ **Login Page**: Form validation, password visibility, remember me
- ✅ **Registration Page**: Advanced validation, password strength meter, terms acceptance
- ✅ **Auth Context**: Mock authentication ready for AWS Cognito

### Document Collaboration
- ✅ **Document Sharing**: Full-featured sharing system (see SHARING_SYSTEM.md)
  - Share via email with permissions (Viewer, Commenter, Editor)
  - User search/autocomplete
  - Manage shared users and permissions
  - Generate shareable links
  - Access level control (Restricted/Public)
  - Remove user access
- ✅ **Version History**: Complete version control system
  - View all document versions
  - Restore previous versions
  - Download specific versions
  - Version metadata tracking
- ✅ **Activity Log**: Comprehensive activity tracking
  - Search and filter activities
  - Document-specific filtering
  - User activity timeline

### Pages
- ✅ Dashboard - Main document view with stats
- ✅ Document Editor - Rich text editing
- ✅ Shared - Shared documents view
- ✅ Starred - Favorited documents
- ✅ Recent - Recently accessed
- ✅ Trash - Deleted items with restore
- ✅ Settings - User preferences
- ✅ Folder View - Tag-based organization

### UI/UX
- ✅ Toast notifications for all actions
- ✅ Loading states and error handling
- ✅ Optimistic UI updates
- ✅ Responsive design (mobile-first)
- ✅ Accessible components
- ✅ Modern, clean interface

## Documentation

- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete feature overview and backend integration guide
- **[FEATURE_CHECKLIST.md](./FEATURE_CHECKLIST.md)** - Detailed checklist of all implemented features
- **[SHARING_SYSTEM.md](./SHARING_SYSTEM.md)** - In-depth documentation of the document sharing system

## Backend Integration Status

All features are **production-ready** with:
- ✅ Complete service layer architecture
- ✅ TypeScript interfaces matching backend schema
- ✅ Mock data structured for DynamoDB
- ✅ Error handling and loading states
- ✅ Ready for AWS integration (Cognito, DynamoDB, S3, SES)

Simply replace mock service calls with real API calls - no UI changes needed!

