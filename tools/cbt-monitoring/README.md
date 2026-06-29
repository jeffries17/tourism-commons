# CBT Monitoring Dashboard

Real-time monitoring system for Community-Based Tourism engagement activities.

## Overview

This system enables ETA staff to:
- 📝 Submit quick updates via internal form
- 📊 View real-time status of all communities in a dashboard
- 📧 Receive automated reminders to keep records current
- 📈 Track engagement metrics and content production

## Architecture

```
Internal Form → API/Firebase → Dashboard
                    ↓
            Automated Emails (Apps Script)
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Setup

1. **Install dependencies:**
   ```bash
   cd tools/cbt-monitoring
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3002/cbt-monitoring`

3. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
tools/cbt-monitoring/
  src/
    pages/
      Dashboard.tsx        # Main dashboard view
      UpdateForm.tsx      # Form for submitting updates
    components/
      CommunityCard.tsx    # Community card component
    hooks/
      useCommunities.ts   # Data fetching hook
    types/
      index.ts            # TypeScript type definitions
    App.tsx               # Main app with routing
    main.tsx              # Entry point
    index.css             # Global styles
```

## Routes

- `/` - Dashboard (main view with community cards)
- `/update` - Update form for submitting community engagement data

## Features

### Dashboard
- 🟢🟡🔴 Color-coded status indicators
- 📊 Engagement percentage bars
- 🔍 Filter by region and status
- 🔎 Search communities, regions, staff, contacts
- 📱 Mobile-responsive design
- 🔗 Direct links to Google Sheet

### Update Form
- Simple, user-friendly interface
- Auto-saved staff name (localStorage)
- Dynamic community dropdown
- Form validation
- Success confirmation

## Configuration

### Environment Variables
- API endpoint: Configured in `src/hooks/useCommunities.ts` (defaults to `/api/cbt/communities`)
- Google Sheet URL: Set in `src/pages/Dashboard.tsx` (currently hardcoded)

### Backend API Endpoints Required

- `GET /api/cbt/communities` - Returns array of community objects
- `POST /api/cbt/update` - Accepts form submission, returns `{ success: boolean, id?: string }`

## Development

The app uses:
- **React 18** with TypeScript
- **Vite** for building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **TanStack Query** for data fetching

### Mock Data
In development mode, if the API is not available, the app will show mock data for testing purposes.

## Deployment

### Firebase Hosting (Recommended)

1. Build the app:
   ```bash
   npm run build
   ```

2. Configure `firebase.json`:
   ```json
   {
     "hosting": {
       "public": "dist",
       "rewrites": [
         {
           "source": "/cbt-monitoring/**",
           "destination": "/cbt-monitoring/index.html"
         }
       ]
     }
   }
   ```

3. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

## Documentation

- **[Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)** - Complete step-by-step setup guide
- **[Quick Start Guide](./docs/QUICK_START.md)** - 5-day MVP setup checklist
- **[Dashboard Plan](./docs/dashboard_plan.md)** - Original requirements and vision

## Support

For technical questions or issues, refer to the troubleshooting section in the [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md).

---

*Part of the Tourism Commons platform*
