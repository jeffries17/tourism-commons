# Google Custom Search API Setup (2 minutes)

## ✅ You Have: API Key
`AIzaSyCgPKAJRRguxmiLJigKT5r42-Sfxu0zaYw`

## 🔍 You Need: Search Engine ID

### Step 1: Create Custom Search Engine
1. Go to: https://programmablesearchengine.google.com/
2. Click **"Add"** (or **"Create"**)
3. Fill in:
   - **Sites to search:** `*` (search entire web)
   - **Name:** `Tourism Assessment Search`
   - **Language:** English
4. Click **"Create"**

### Step 2: Get Search Engine ID
1. After creating, you'll see a page with your search engine
2. Look for **"Search engine ID"** (starts with numbers like `017576662512468239146:omuauf_lfve`)
3. Copy this ID

### Step 3: Test It
```bash
export GOOGLE_API_KEY='AIzaSyCgPKAJRRguxmiLJigKT5r42-Sfxu0zaYw'
export GOOGLE_SEARCH_ENGINE_ID='your-search-engine-id-here'
python3 test_google_search.py
```

## 🎯 What You'll See When It Works
```
✅ SUCCESS! Found 5 results

1. West African Tours - Gambia Tourism
   URL: https://westafricantoursinfo.com/
   Description: Professional tour operator...

2. West African Tours | Facebook
   URL: https://www.facebook.com/watoursgambia/
   Description: West African Tours Gambia...
```

## 🚀 Then Run Full Assessment
```bash
python3 test_automated_assessment.py 'West African Tours'
```

This will:
- Search Google for the stakeholder
- Find their website, Facebook, Instagram
- Scrape their website
- Auto-evaluate 13+ criteria
- Write results to Checklist Detail
- Update TO Assessment automatically

## 💡 Pro Tip
The Search Engine ID is free and takes 30 seconds to create. Once you have it, you can search for any stakeholder and auto-fill their digital presence data!
