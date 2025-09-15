# Sentiment Analysis Data Structure

This directory contains the organized data structure for sentiment analysis of creative industries and tourism stakeholders across West Africa.

## Folder Structure

```
sentiment_data/
├── config/                          # Configuration files
│   ├── analysis_themes.json        # Theme definitions and keywords
│   └── stakeholder_mapping.json    # Stakeholder matching rules
├── raw_reviews/                     # Raw review data from platforms
│   └── oct_2025/                   # Collection period (October 2025)
│       ├── gambia/                 # Country-specific folders
│       │   ├── wassu_stone_circles/
│       │   │   └── tripadvisor_reviews.json
│       │   ├── brikama_woodcarvers_market/
│       │   ├── kunta_kinteh_island/
│       │   ├── banjul_craft_market/
│       │   ├── ebunjan_theatre/
│       │   ├── ebunjan_theatre_company/
│       │   ├── abuko_nature_reserve/
│       │   ├── arch_22_museum/
│       │   ├── senegambia_craft_market/
│       │   ├── tanji_village_museum/
│       │   ├── fort_bullen_barra_museum/
│       │   ├── kachikally_crocodile_pool/
│       │   ├── bakau_craft_market/
│       │   ├── national_museum_gambia/
│       │   └── african_adventure_tours/
│       ├── senegal/
│       ├── cape_verde/
│       ├── ghana/
│       ├── benin/
│       └── nigeria/
└── processed/                      # Processed analysis results
    ├── oct_2025_sentiment_analysis.json
    └── oct_2025_cross_country_comparison.json
```

## Usage Instructions

### 1. Adding New Review Data

1. **Create stakeholder folder**: Use the normalized name from `stakeholder_mapping.json`
2. **Add JSON files**: Place platform-specific JSON files in the stakeholder folder
3. **Follow naming convention**: `{platform}_reviews.json` (e.g., `tripadvisor_reviews.json`)

### 2. JSON File Structure

Each review file should follow this structure:
```json
{
  "collection_metadata": {
    "source": "tripadvisor",
    "stakeholder": "stakeholder_name",
    "collection_date": "2025-10-15",
    "total_reviews": 0,
    "language_distribution": {},
    "date_range": {
      "earliest": null,
      "latest": null
    }
  },
  "reviews": [
    {
      "review_id": "unique_id",
      "title": "Review Title",
      "text": "Review content...",
      "rating": 5,
      "date": "2025-09-15",
      "language": "en",
      "user": {
        "user_id": "user_id",
        "name": "User Name",
        "location": "Country",
        "review_count": 15,
        "helpful_votes": 3
      },
      "place_info": {
        "name": "Business Name",
        "category": "Business Type",
        "location": "Full Address",
        "coordinates": {
          "lat": 13.6919,
          "lng": -15.3228
        }
      },
      "metadata": {
        "source_url": "https://example.com",
        "scraped_at": "2025-10-15T10:30:00Z"
      }
    }
  ]
}
```

### 3. Configuration Files

- **`analysis_themes.json`**: Defines universal and sector-specific themes for sentiment analysis
- **`stakeholder_mapping.json`**: Maps business names to normalized identifiers and provides matching rules

### 4. Processing Pipeline

1. **Data Collection**: Store JSON files in appropriate stakeholder folders
2. **Translation**: Translate reviews to English while preserving source language metadata
3. **Stakeholder Matching**: Match reviews to existing stakeholder list using business names
4. **Theme Extraction**: Apply theme framework to extract relevant aspects
5. **Sentiment Analysis**: Calculate overall and theme-specific sentiment scores
6. **Aggregation**: Aggregate results by stakeholder, sector, and country
7. **Google Sheets Integration**: Push processed results to existing sheet structure

## Next Steps

1. **Replace sample files**: Replace the sample JSON files with actual TripAdvisor data
2. **Add more stakeholders**: Create folders for additional stakeholders as needed
3. **Run processing pipeline**: Execute the sentiment analysis on the collected data
4. **Update Google Sheets**: Integrate results with existing assessment framework

## Notes

- All timestamps should be in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
- Language codes should follow ISO 639-1 standard (en, fr, pt, etc.)
- Coordinates should be in decimal degrees format
- Review IDs should be unique within each collection period
