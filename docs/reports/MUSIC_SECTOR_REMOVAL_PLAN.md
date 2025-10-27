# 🎵 Music Sector Removal Plan

## Problem Statement

The **Music sector exists only in Regional Assessment** but not in CI Assessment, making sector-by-sector comparisons invalid. This creates misleading analysis where Music shows 0 Gambia entries vs 24 regional entries.

## Current State

### Music Entries in Regional Assessment:
- **24 entries** (12.1% of all regional data)
- **Top performers**: Burna Boy (35), School of Performing Arts Ghana (33), Youssou N'Dour (33)
- **Countries**: Nigeria (5), Ghana (4), Senegal (4), Cape Verde (4), Benin (7)

### Files Containing Music References:
1. **Google Sheets**: Regional Assessment sheet (24 rows to delete)
2. **Dashboard Data**: `dashboard_region_data.json` (sector comparison, analysis)
3. **Analysis Documents**: `TOP_REGIONAL_COMPETITORS_ANALYSIS.md`
4. **Research Prompts**: `CHATGPT_RESEARCH_PROMPTS.md`

---

## 🎯 Removal Steps

### **Step 1: Remove from Google Sheet (5 minutes)**
**Action**: Delete Music sector rows from Regional Assessment sheet

**Rows to delete** (24 entries):
- Row 15: Burna Boy (artist) (Nigeria)
- Row 17: School of Performing Arts, Univ. of Ghana (Legon)
- Row 18: Youssou N'Dour / Jololi Music Group (Senegal)
- Row 29: Studio Sankara / Studio 44 (Senegal)
- Row 31: Mavin Records (Lagos) (Nigeria)
- Row 44: Orchestra Baobab (Senegal)
- Row 57: Chocolate City (Lagos) (Nigeria)
- Row 61: Angélique Kidjo (Benin)
- Row 71: Wizkid (artist) (Nigeria)
- Row 97: M_EIA – Instituto Universitário de Arte, Tecnologia e Cultura (Mindelo)
- Row 119: Cesária Évora (Cape Verde)
- Row 130: New Afrika Shrine (Lagos) – venue (Nigeria)
- Row 132: AFRICA NATION Radio/TV (Cotonou) (Benin)
- Row 136: Orchestre Poly-Rythmo de Cotonou (Benin)
- Row 137: Sarkodie (artist) (Ghana)
- Row 140: Mayra Andrade (artist) (Cape Verde)
- Row 147: Baaba Maal (Senegal)
- Row 155: Dakar Music Expo (Senegal)
- Row 157: Kwesi Arthur (artist) (Ghana)
- Row 158: Palácio da Cultura Ildo Lobo (Praia) (Cape Verde)
- Row 164: Elida Almeida (artist) (Cape Verde)
- Row 180: Conservatoire Danses Cérémonielles Royales Bénin (Benin)
- Row 181: Kuvie (producer, Accra) (Ghana)
- Row 200: Benin Jazz Festival (Cotonou) (Benin)

**Method**: 
1. Open Regional Assessment sheet
2. Filter by Sector = "Music (artists, production, venues, education)"
3. Select all filtered rows
4. Delete rows
5. Remove filter

---

### **Step 2: Regenerate Dashboard Data (10 minutes)**
**Action**: Run dashboard data generation scripts to update JSON files

**Files to regenerate**:
- `digital_assessment/dashboard/public/data/dashboard_region_data.json`
- `digital_assessment/data/dashboard_region_data.json`

**Scripts to run**:
```bash
cd /Users/alexjeffries/tourism-commons/digital_assessment
python3 generate_regional_dashboard_data.py
```

**Expected changes**:
- Remove Music from `sector_comparison` array
- Remove Music from `sector_analysis` array  
- Remove Music from `category_leaders` object
- Update country counts (Nigeria: -5, Ghana: -4, Senegal: -4, Cape Verde: -4, Benin: -7)

---

### **Step 3: Update Analysis Documents (15 minutes)**
**Action**: Remove Music references from analysis documents

**Files to update**:

#### A. `TOP_REGIONAL_COMPETITORS_ANALYSIS.md`
- Remove Music section from "Top 3 Performers by Sector"
- Remove Burna Boy from "Top 10 Overall Performers" 
- Remove Music from "Sector-Specific Insights"
- Update sector count from 8 to 7

#### B. `CHATGPT_RESEARCH_PROMPTS.md`
- Remove Music section (3 prompts for Burna Boy, School of Performing Arts, Youssou N'Dour)
- Update sector count references

---

### **Step 4: Update Dashboard Code (5 minutes)**
**Action**: Remove Music references from dashboard components

**Files to check**:
- `digital_assessment/dashboard/src/pages/RegionalAnalysis.tsx`
- `digital_assessment/dashboard/src/config/categoryDescriptions.ts`

**Changes needed**:
- Remove Music from sector lists
- Remove Music from category descriptions
- Update any hardcoded sector counts

---

### **Step 5: Test and Verify (10 minutes)**
**Action**: Verify all changes work correctly

**Tests to run**:
1. **Dashboard loads** without Music references
2. **Sector comparison** shows only 7 sectors (not 8)
3. **Regional analysis** excludes Music data
4. **No broken links** or missing references

---

## 📊 Expected Results After Removal

### **Sector Count**:
- **Before**: 8 sectors (including Music)
- **After**: 7 sectors (Music removed)

### **Regional Assessment Data**:
- **Before**: 199 rows (24 Music entries)
- **After**: 175 rows (0 Music entries)

### **Country Distribution Changes**:
- **Nigeria**: -5 entries (from Music)
- **Ghana**: -4 entries (from Music)  
- **Senegal**: -4 entries (from Music)
- **Cape Verde**: -4 entries (from Music)
- **Benin**: -7 entries (from Music)

### **Top Performers Update**:
- **Burna Boy** (Music, Score: 35) removed from top 10
- **New #10**: Next highest performer from remaining sectors

---

## ⚠️ Important Considerations

### **Data Loss**:
- **24 Music entries** will be permanently removed
- **Top performers** like Burna Boy, Youssou N'Dour will be lost from analysis
- **Country representation** will be reduced

### **Alternative Approaches**:
1. **Keep Music, Add to CI Assessment**: Add Music entries to CI Assessment sheet
2. **Separate Analysis**: Keep Music in separate "Music Industry Analysis"
3. **Reclassify**: Move some Music entries to "Performing and Visual Arts"

### **Recommendation**:
**Remove Music** to ensure valid sector-by-sector comparison, as this is the core requirement for the TOR analysis.

---

## 🚀 Implementation Order

1. **Google Sheet** (Manual, 5 min)
2. **Dashboard Data** (Script, 10 min)  
3. **Analysis Documents** (Manual, 15 min)
4. **Dashboard Code** (Manual, 5 min)
5. **Testing** (Manual, 10 min)

**Total Time**: ~45 minutes

---

## ✅ Success Criteria

- [ ] Music entries removed from Regional Assessment sheet
- [ ] Dashboard data regenerated without Music references
- [ ] Analysis documents updated to exclude Music
- [ ] Dashboard loads without Music sector
- [ ] Sector comparison shows only 7 sectors
- [ ] No broken references or errors

---

*This plan ensures clean sector-by-sector comparison for the Gambia Creative Industries Digital Assessment project.*
