# Digital Assessment Dashboard

A modern, modular React + TypeScript dashboard for visualizing and managing digital assessment data.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Prerequisites

- Node.js 18+ 
- Firebase Functions running locally (port 5001) or deployed

## 🏗️ Architecture

### Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Charts**: Recharts (to be implemented)

### Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── charts/          # Chart components
│   ├── layout/          # Header, Footer, Layout
│   └── sections/        # Dashboard sections
├── pages/               # Route pages
│   ├── Dashboard.tsx
│   ├── ParticipantList.tsx
│   ├── ParticipantDetail.tsx
│   └── Methodology.tsx
├── services/            # API client
│   └── api.ts
├── hooks/               # Custom React hooks
├── types/               # TypeScript types
├── config/              # Configuration
│   ├── countries/       # Country-specific configs
│   └── index.ts
└── utils/               # Helper functions
```

## 🌍 Multi-Country Support

The dashboard is designed to support multiple countries with minimal configuration changes.

### Adding a New Country

1. Create a new config file in `src/config/countries/`:

```typescript
// src/config/countries/senegal.ts
import { CountryConfig } from '../../types';

export const senegalConfig: CountryConfig = {
  name: 'Senegal',
  code: 'SN',
  // ... other configuration
};
```

2. Import and register in `src/config/index.ts`

3. Update the current country or add routing logic

## 🔌 API Integration

The dashboard connects to Firebase Functions backend via a proxy configuration.

### Local Development

The Vite dev server proxies API requests to Firebase Functions:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001/tourism-development-d620c/us-central1/app`
- API calls: `/api/*` → proxied to backend

### Available Endpoints

- `GET /api/participants` - List all participants
- `GET /api/participants?sector={sector}` - Filter by sector
- `GET /api/participant/plan?name={name}` - Get participant details
- `GET /api/participant/opportunities?name={name}` - Get recommendations

## 🎨 Design System

### Colors

- Primary: `#1565c0` (Blue)
- Secondary: `#7b1fa2` (Purple)
- Success: `#28a745`
- Warning: `#ffc107`
- Error: `#dc3545`

### Typography

- Headings: Inter Tight (font-heading)
- Body: Inter (font-sans)
- Code: Fira Code (font-mono)

## 📦 Deployment

### Firebase Hosting

```bash
# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting:dashboard
```

### Environment Variables

Create a `.env` file for environment-specific configuration:

```
VITE_FIREBASE_FUNCTIONS_URL=https://us-central1-tourism-development-d620c.cloudfunctions.net/app
```

## 🧪 Testing (To Be Implemented)

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## 📚 Key Features

### Phase 1 (Completed ✅)
- [x] React + TypeScript setup with Vite
- [x] Tailwind CSS configuration
- [x] React Router setup
- [x] React Query integration
- [x] Base layout components
- [x] Shared TypeScript types
- [x] Country configuration system
- [x] Firebase proxy configuration

### Phase 2 (In Progress)
- [ ] Dashboard overview with live data
- [ ] Participant list with filtering
- [ ] Individual participant detail pages
- [ ] Charts and visualizations
- [ ] AI recommendations display

### Phase 3 (Planned)
- [ ] Sector analysis
- [ ] Data export functionality
- [ ] Admin features
- [ ] Responsive design refinement

## 🔧 Configuration

### Tailwind CSS

Custom configuration in `tailwind.config.js`:
- Custom colors matching design system
- Custom fonts
- Extended theme utilities

### Vite

Custom configuration in `vite.config.ts`:
- Dev server on port 3000
- API proxy to Firebase Functions
- Build optimizations

## 📖 Documentation

- [Architecture Overview](../docs/implementation_plan.md)
- [API Documentation](../functions/README.md)
- [Country Adaptation Guide](./docs/country-adaptation.md) (to be created)

## 🤝 Contributing

When adding new features:

1. Keep components modular and reusable
2. Add TypeScript types for all data structures
3. Use React Query for all API calls
4. Follow the existing folder structure
5. Update this README with new features

## 🐛 Troubleshooting

### API Proxy Not Working

Make sure Firebase Functions are running:
```bash
cd ../functions
npm run serve
```

### Build Errors

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 License

Part of the Tourism Commons Digital Assessment Platform.

---

*Last updated: October 2, 2025*
