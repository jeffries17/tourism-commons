# Shared Code

This directory contains reusable code that can be shared across multiple projects.

## Structure

```
shared/
├── analysis/     # Reusable analysis functions
├── components/   # Shared React components
└── utils/        # Shared utility functions
```

## Usage

### In Python

```python
from shared.utils.project_loader import ProjectLoader, load_project_data

# Load project configuration
loader = ProjectLoader()
config = loader.load_project("gambia")

# Load project data
data = load_project_data("gambia", "regional")
```

### In JavaScript/React

```javascript
import { ProjectLoader } from '../shared/utils/project-loader';

// Load project configuration
const config = ProjectLoader.load('gambia');
```

## What Goes Here

### Analysis
- Data scoring functions
- Statistical analysis utilities
- Chart generation helpers
- Report generation templates

### Components
- Reusable UI components
- Common layouts
- Shared chart components
- Form components

### Utils
- Data loading utilities
- Project configuration loaders
- Common helper functions
- Validation utilities

## What Should NOT Go Here

- Project-specific data
- Project-specific configurations
- Project-specific analysis logic
- Hard-coded project references

