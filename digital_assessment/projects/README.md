# Multi-Project Architecture

This directory contains project-specific modules for the Digital Assessment platform. Each project has its own data, configuration, analysis scripts, and outputs.

## Structure

```
projects/
├── gambia/           # The Gambia project
│   ├── data/        # Project-specific data files
│   ├── config/      # Project configuration
│   ├── analysis/    # Project-specific analysis scripts
│   ├── outputs/     # Generated reports and outputs
│   └── public/      # Project-specific public assets
└── benin/           # Benin project (template)
    ├── data/
    ├── config/
    ├── analysis/
    ├── outputs/
    └── public/
```

## Project Configuration

Each project has a `config/project_config.json` file that defines:
- Project metadata (name, slug, basename)
- Theme configuration
- Feature flags
- Data sources
- Available routes
- API endpoints
- Google Sheets configuration
- Deployment settings

## Adding a New Project

1. Create a new directory under `projects/`
2. Copy the structure from an existing project or `benin/` template
3. Create `config/project_config.json` with project-specific settings
4. Add project data files to the `data/` directory
5. Project-specific analysis scripts go in `analysis/`
6. Generated outputs go in `outputs/`

## Current Projects

- **gambia**: The Gambia Digital Assessment (active)
- **benin**: Benin Digital Assessment (template/prepared for future use)

## Shared Code

Code that should be reused across projects lives in the parent `shared/` directory:
- `/shared/analysis/` - Reusable analysis functions
- `/shared/components/` - Shared React components
- `/shared/utils/` - Shared utility functions

