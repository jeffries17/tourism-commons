# Tourism Commons

A space for sharing, learning, and growing together. Tourism Commons provides free tools, open research, and community‑driven tourism development to enable emerging destinations and stakeholders to enhance competitiveness, foster sustainability, and tell their own stories.

Built with the International Trade Centre (ITC).

## Project Structure

```
tourism-commons/
├── website/              # TourismCommons landing page
├── tools/                # Various tools and dashboards
│   └── digital-assessment/  # Digital capacity assessment tool (Gambia + Benin)
├── docs/                 # Documentation
└── digital_assessment/   # Data and analysis (legacy, being migrated)
```

## Tools

### Digital Assessment Dashboard
Assess digital capacity and opportunities for creative industries and tourism operators.

**Gambia Dashboard:** `/gambia-itc`
**Benin Sentiment Analysis:** `/benin-sentiment`

## Development

```bash
# Build and deploy everything
npm run build && npm run deploy

# Build individual components
npm run build:website
npm run build:tools

# Run dev server for digital assessment tool
npm run dev
```

## Deployment

Automatically deployed to Firebase Hosting via GitHub Actions.

**Live Site:** https://tourism-development-d620c.web.app

