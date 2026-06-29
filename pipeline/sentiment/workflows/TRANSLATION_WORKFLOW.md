# Translation Workflow for Sentiment Analysis

## Overview
This workflow creates English-only versions of review files for consistent sentiment analysis across all languages.

## Process Flow

### 1. **Raw Data Collection**
```
kunta_kinteh_reviews.json (Mixed languages: Dutch, English, French, German)
```

### 2. **Translation Processing**
```
kunta_kinteh_reviews_ENG.json (All English, with language metadata)
```

### 3. **Analysis Ready**
```
- Consistent language for sentiment analysis
- Preserved original language information
- Enhanced metadata for cross-language insights
```

## File Structure

### Input Format (Raw Data)
```json
[
  {
    "title": "Worth a stop",
    "rating": 4,
    "text": "Review content in original language...",
    "user": {
      "userLocation": {"name": "Richmond, Virginia"},
      "contributions": {"totalContributions": 212}
    },
    "placeInfo": {"name": "Kunta Kinteh Island"}
  }
]
```

### Output Format (English Only)
```json
{
  "collection_metadata": {
    "source": "tripadvisor",
    "stakeholder": "kunta_kinteh_island",
    "total_reviews": 24,
    "language_distribution": {
      "nl": 11,
      "en": 6,
      "fr": 4,
      "de": 3
    },
    "translation_applied": true
  },
  "reviews": [
    {
      "review_id": "user123_0",
      "title": "Worth a stop",
      "text": "Translated review content...",
      "rating": 4,
      "language_detected": "en",
      "language_original": "nl",
      "user": {
        "location": "Richmond, Virginia",
        "review_count": 212
      }
    }
  ]
}
```

## Usage Instructions

### 1. **Test Translation Setup**
```bash
python3 test_translation.py
```
This verifies your Google Cloud Translation API setup.

### 2. **Translate Single File**
```bash
python3 translate_reviews.py
```
Processes the Kunta Kinteh Island file specifically.

### 3. **Batch Translate All Files**
```bash
python3 batch_translate.py
```
Processes all review files in the directory structure.

## Language Detection & Translation

### **Supported Languages**
- **Dutch (nl)** - 45.8% of Kunta Kinteh reviews
- **English (en)** - 25.0% (no translation needed)
- **French (fr)** - 16.7%
- **German (de)** - 12.5%
- **Spanish (es)** - Detected but not present in current data

### **Language Detection Method**
Uses regex patterns to identify language before translation:
- Dutch: `\b(de|het|een|van|op|in|met)\b`
- French: `\b(le|la|les|un|une|des)\b`
- German: `\b(der|die|das|ein|eine)\b`
- Spanish: `\b(el|la|los|las|un|una)\b`

### **Translation Features**
- **Caching**: Avoids re-translating identical text
- **Error Handling**: Returns original text if translation fails
- **Metadata Preservation**: Keeps original language information
- **Quality Control**: Uses Google Cloud Translation API for accuracy

## Benefits

### **For Analysis**
1. **Consistent Language**: All sentiment analysis on English text
2. **Theme Extraction**: Universal theme keywords work across all reviews
3. **Cross-Language Insights**: Compare sentiment by original language
4. **Quality Metrics**: Track translation success rates

### **For Reporting**
1. **Language Distribution**: Show international visitor demographics
2. **Regional Insights**: Compare sentiment by visitor origin
3. **Translation Quality**: Monitor API performance and costs

## File Naming Convention

### **Raw Files**
- `{stakeholder}_reviews.json`
- `kunta_kinteh_reviews.json`
- `wassu_stone_circles_reviews.json`

### **English Files**
- `{stakeholder}_reviews_ENG.json`
- `kunta_kinteh_reviews_ENG.json`
- `wassu_stone_circles_reviews_ENG.json`

## Integration with Sentiment Analysis

### **Processing Pipeline**
1. **Raw Collection**: Store original language files
2. **Translation**: Create English versions with `_ENG.json` suffix
3. **Analysis**: Run sentiment analysis on English files
4. **Reporting**: Include language distribution in results

### **Google Sheets Integration**
- **Language Mix Column**: Show original language distribution
- **Translation Status**: Indicate which reviews were translated
- **Cross-Language Analysis**: Compare sentiment by visitor language

## Cost Considerations

### **Google Cloud Translation API**
- **Pricing**: $20 per 1M characters
- **Typical Review**: ~500 characters
- **Cost per Review**: ~$0.01
- **Kunta Kinteh (24 reviews)**: ~$0.24

### **Optimization**
- **Caching**: Avoid duplicate translations
- **Batch Processing**: Efficient API usage
- **Error Handling**: Minimize failed requests

## Next Steps

1. **Test Setup**: Run `test_translation.py`
2. **Process Sample**: Translate Kunta Kinteh file
3. **Validate Results**: Check translation quality
4. **Batch Process**: Translate all review files
5. **Integrate Analysis**: Use English files for sentiment analysis
