# Project Registry

This directory contains JSON files defining all Tourism Commons projects. Each project file specifies:

- **Metadata**: name, slug, status, year, client
- **Description**: Public summary and full description
- **Themes**: Associated topic tags
- **Links**: Related deliverables and resources (with protected flag)

## Structure

Each project file follows this schema:

```json
{
  "name": "Country or Project Name",
  "slug": "url-friendly-slug",
  "status": "active|ongoing|completed",
  "year": 2026,
  "client": "Client Name / Partner",
  "summary": "One-line summary for listings",
  "description": "Full description for detail pages",
  "themes": ["theme1", "theme2"],
  "protected": true,
  "links": [
    {
      "label": "Deliverable Name",
      "href": "/path/to/deliverable",
      "protected": true
    }
  ]
}
```

## Adding a New Project

1. Create a new JSON file: `{slug}.json`
2. Define the project metadata and links
3. Update the registry in the Next.js app (`app/app/projects/page.tsx`)
4. Create a project detail page if needed

## Notes

- `slug` must be URL-safe (lowercase, hyphens only)
- All projects are currently `protected: true` — content requires access tokens
- Links can point to existing static assets (`/gambia-birdfair`) or new Next.js routes (`/projects/gambia/workshop`)
