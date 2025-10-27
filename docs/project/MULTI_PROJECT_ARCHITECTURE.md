# Multi-Project Architecture Migration Plan

## Goal
Transform the current Gambia-specific digital assessment platform into a reusable multi-project architecture that can support multiple countries/projects while sharing a single codebase.

## Current State
- Everything is hardcoded for The Gambia
- Data files are project-specific but mixed with core functionality
- Dashboard routes use hardcoded `/gambia-itc` paths
- All configuration is embedded in the code

## Target State
- Modular architecture with shared core and project-specific modules
- Each project has its own data, config, and outputs
- Dashboard dynamically loads project configuration
- Easy to add new projects without touching core code

---

## Phase 1: Foundation (No Breaking Changes)

### 1.1 Create New Directory Structure
- [ ] Create `projects/` directory
- [ ] Create `projects/gambia/` with subdirectories:
  - [ ] `data/` (move existing data files)
  - [ ] `config/` (project-specific configuration)
  - [ ] `analysis/` (project-specific analysis scripts)
  - [ ] `outputs/` (generated reports)
- [ ] Create `shared/` directory:
  - [ ] `analysis/` (reusable analysis functions)
  - [ ] `components/` (shared React components)
  - [ ] `utils/` (shared utilities)

### 1.2 Extract Reusable Code
- [ ] Identify and move shared Python utilities to `shared/`
  - [ ] Survey processing functions
  - [ ] Google Sheets integration
  - [ ] Data scoring logic
  - [ ] Common analysis functions
- [ ] Identify and move shared React components to `shared/`
  - [ ] Chart components
  - [ ] Common UI components
  - [ ] Layout components

### 1.3 Create Project Configuration System
- [ ] Define `project_config.json` schema:
  ```json
  {
    "name": "Gambia",
    "slug": "gambia-itc",
    "displayName": "The Gambia",
    "basename": "/gambia-itc",
    "theme": {...},
    "features": [...],
    "dataPaths": {...},
    "routes": [...]
  }
  ```
- [ ] Create initial config for Gambia

---

## Phase 2: Refactor Existing Code (Breaking Changes Planned)

### 2.1 Move Gambia-Specific Code
- [ ] Copy (don't move yet) Gambia analysis scripts to `projects/gambia/analysis/`
- [ ] Copy Gambia data files to `projects/gambia/data/`
- [ ] Copy generated outputs to `projects/gambia/outputs/`

### 2.2 Update Data Loading Logic
- [ ] Refactor dashboard to load data from project-specific paths
- [ ] Update analysis scripts to accept project as parameter
- [ ] Create data loading utility functions

### 2.3 Update Dashboard Routing
- [ ] Make routes dynamic based on project config
- [ ] Update all hardcoded `/gambia-itc` references to use config
- [ ] Implement project switcher/locale functionality

---

## Phase 3: Create Shared Core

### 3.1 Extract Core Functionality
- [ ] Create shared API functions
- [ ] Create shared authentication logic
- [ ] Create shared data processing pipeline
- [ ] Create shared dashboard framework

### 3.2 Create Project Loader
- [ ] Build dynamic project configuration loader
- [ ] Create project context/provider in React
- [ ] Implement project switching mechanism

### 3.3 Documentation
- [ ] Document configuration schema
- [ ] Create guide for adding new projects
- [ ] Document migration process for existing data

---

## Phase 4: Migrate to New Structure

### 4.1 Fully Migrate Gambia
- [ ] Move (not copy) all Gambia files to new structure
- [ ] Update all imports and paths
- [ ] Test that everything still works

### 4.2 Update Build & Deploy
- [ ] Update build scripts for multi-project structure
- [ ] Update Firebase hosting configuration
- [ ] Add deployment scripts for multiple projects

### 4.3 Testing
- [ ] Verify all Gambia functionality works
- [ ] Test data loading from new paths
- [ ] Test authentication and routing

---

## Phase 5: Enable New Projects

### 5.1 Create Benin Project Structure
- [ ] Create `projects/benin/` directory structure
- [ ] Create initial project configuration
- [ ] Set up data import process

### 5.2 Add Project Selector
- [ ] Add project selection UI to dashboard
- [ ] Or configure separate deployments per project
- [ ] Update navigation to support multiple projects

### 5.3 Test with Real Project
- [ ] Import Benin data
- [ ] Generate Benin analysis
- [ ] Deploy Benin-specific instance or add to main app

---

## Project Configuration Schema

### project_config.json
```json
{
  "project": {
    "id": "gambia",
    "name": "The Gambia",
    "slug": "gambia-itc",
    "basename": "/gambia-itc",
    "theme": {
      "primaryColor": "#0066cc",
      "logo": "/gambia-logo.svg"
    },
    "features": {
      "enableRegionalAnalysis": true,
      "enableITOPerception": true,
      "enableSentimentAnalysis": true
    },
    "data": {
      "sources": {
        "participants": "./projects/gambia/data/participants.json",
        "regional": "./projects/gambia/data/dashboard_region_data.json",
        "sentiment": "./projects/gambia/data/sentiment_data.json"
      }
    },
    "routes": [
      {
        "path": "/dashboard",
        "component": "Dashboard",
        "admin": true
      },
      {
        "path": "/region",
        "component": "RegionalAnalysis",
        "admin": true
      }
    ]
  }
}
```

---

## Directory Structure

```
digital_assessment/
├── core/                          # Core functionality
│   ├── auth_server.py
│   ├── proxy_server.py
│   └── api functions
│
├── shared/                        # Shared reusable code
│   ├── analysis/
│   │   ├── common_analysis.py    # Reusable analysis functions
│   │   └── scoring_utils.py      # Shared scoring logic
│   ├── components/               # Shared React components
│   │   ├── charts/
│   │   ├── layout/
│   │   └── common/
│   └── utils/
│       ├── data_loader.py
│       └── project_loader.py
│
├── projects/                     # Project-specific code and data
│   ├── gambia/
│   │   ├── config/
│   │   │   ├── project_config.json
│   │   │   └── dashboard_config.json
│   │   ├── data/                 # Project-specific data
│   │   ├── analysis/             # Project-specific analysis
│   │   ├── outputs/              # Generated reports
│   │   └── public/               # Project-specific public assets
│   └── benin/                    # New project template
│       ├── config/
│       ├── data/
│       ├── analysis/
│       └── outputs/
│
├── dashboard/                     # Shared dashboard code
│   ├── src/
│   │   ├── projects/             # Project-specific pages/components
│   │   │   ├── gambia/
│   │   │   └── benin/
│   │   ├── shared/               # Shared components
│   │   └── App.tsx               # Multi-project routing
│   └── dist/
│
├── data_processing/              # Shared data processing
├── utilities/                     # Shared utilities
└── config/                        # Global configuration
```

---

## Key Challenges to Address

1. **Data Loading**: How to dynamically load project-specific data
2. **Routing**: How to handle different basenames per project
3. **Build Process**: How to build for different projects
4. **Deployment**: Deploy all projects or separate deployments?
5. **Configuration Management**: Where to store and how to load config
6. **Database**: How to handle project-specific data in Firebase/sheets
7. **Versioning**: How to handle different versions of shared code

---

## Success Criteria

- [ ] Can add a new project (e.g., Benin) without touching core code
- [ ] Shared improvements benefit all projects
- [ ] Each project has its own data and outputs
- [ ] Build and deployment process is straightforward
- [ ] Configuration is centralized and maintainable
- [ ] No breaking changes to existing Gambia project

