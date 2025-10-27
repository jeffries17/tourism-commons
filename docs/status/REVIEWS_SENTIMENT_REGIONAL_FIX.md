# Reviews & Sentiment: Data Fixes

## Issue 1: Regional Competitors Tab Crash
When opening the Regional Competitors tab on the `/reviews-sentiment` page, the application crashed with:
```
TypeError: Cannot read properties of undefined (reading 'response_rate')
```

## Issue 2: Broken Participant Links
The "View Details" links on the stakeholder table were generating broken URLs. The stakeholder names in the sentiment data (e.g., `senegambia_craft_market`) don't match the actual participant names in the CI Assessment (e.g., `Serrekunda (Senegambia) Craft Market`), causing 404 errors when users clicked the links.

**Examples of mismatches:**
- Sentiment: `senegambia_craft_market` → Participant: `Serrekunda (Senegambia) Craft Market`
- Sentiment: `abuko_nature_reserve` → Participant: `Abuko Nature Reserve`
- Sentiment: `wassu_stone_circles` → Participant: `Wassu Stone Circles`

## Root Cause
The regional competitors sentiment data (`regional_sentiment.json`) has a different structure than the creative industries and tour operators data:

1. **Creative Industries & Tour Operators**: Have `management_response_rate` field (direct property)
2. **Regional Competitors**: Do NOT have any management response data at all

The code was attempting to access `s.management_response.response_rate` which:
- Doesn't exist in the expected form for any dataset
- Wasn't checking if the field exists before accessing it

## Changes Made

### 1. Updated Interface (`StakeholderSentiment`)
- Made multiple fields optional (with `?`) since they may not be present in all datasets
- Added `management_response_rate?: number` field for the direct property that exists in creative/operators data
- Made `management_response` object optional

### 2. Fixed Aggregate Calculation (Line 117-121)
Changed from:
```typescript
const avgResponseRate = stakeholdersWithReviews.reduce((sum, s) => sum + s.management_response.response_rate, 0) / stakeholdersWithReviews.length;
```

To:
```typescript
// Calculate average response rate (only for stakeholders that have this data)
const stakeholdersWithResponseRate = stakeholdersWithReviews.filter(s => s.management_response_rate !== undefined);
const avgResponseRate = stakeholdersWithResponseRate.length > 0
  ? stakeholdersWithResponseRate.reduce((sum, s) => sum + (s.management_response_rate || 0), 0) / stakeholdersWithResponseRate.length
  : 0;
```

### 3. Fixed Table Display (Line 501-511)
Changed from:
```typescript
<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
  stakeholder.management_response.response_rate > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
}`}>
  {stakeholder.management_response.response_rate.toFixed(0)}%
</span>
```

To:
```typescript
{stakeholder.management_response_rate !== undefined ? (
  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
    stakeholder.management_response_rate > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }`}>
    {stakeholder.management_response_rate.toFixed(0)}%
  </span>
) : (
  <span className="text-gray-400 text-sm">N/A</span>
)}
```

### 4. Conditional Management Response Section (Line 433-454)
Wrapped the "Management Response Opportunity" section in a conditional to only display for creative industries and tour operators:
```typescript
{activeTab !== 'regional' && (
  <div className="bg-gradient-to-r from-yellow-50 to-orange-50...">
    {/* Management Response Opportunity content */}
  </div>
)}
```

### 5. Implemented Smart Participant Name Matching (Line 91-121)
Created a `findParticipantName()` helper function that:
- Loads the participants list using `useParticipants()` hook
- Normalizes both stakeholder and participant names (removes underscores, converts to lowercase)
- Performs fuzzy matching using multiple strategies:
  - Exact match after normalization
  - Contains check (one name contains the other)
  - Word-by-word matching (handles reordering and slight variations)
- Returns the actual participant name if a match is found, or `null` if no match

```typescript
const findParticipantName = (stakeholderName: string): string | null => {
  if (!participants || !stakeholderName) return null;
  
  // Normalize the stakeholder name: remove underscores, convert to lowercase
  const normalizedStakeholder = stakeholderName.replace(/_/g, ' ').toLowerCase().trim();
  
  // Try to find exact or close match in participants list
  const match = participants.find(p => {
    const normalizedParticipant = p.name.toLowerCase().trim();
    
    // Check for exact match
    if (normalizedParticipant === normalizedStakeholder) return true;
    
    // Check if participant name contains stakeholder name or vice versa
    if (normalizedParticipant.includes(normalizedStakeholder)) return true;
    if (normalizedStakeholder.includes(normalizedParticipant)) return true;
    
    // Check if all words from stakeholder are in participant (handles reordering)
    const stakeholderWords = normalizedStakeholder.split(' ').filter(w => w.length > 2);
    const participantWords = normalizedParticipant.split(' ').filter(w => w.length > 2);
    const allWordsMatch = stakeholderWords.every(word => 
      participantWords.some(pWord => pWord.includes(word) || word.includes(pWord))
    );
    if (allWordsMatch && stakeholderWords.length > 0) return true;
    
    return false;
  });
  
  return match ? match.name : null;
};
```

### 6. Updated Table Links (Line 548-560)
Modified the "View Details" link to:
- Call `findParticipantName()` for each stakeholder
- Only render the link if a match is found
- Use the matched participant name (not the stakeholder name) in the URL

```typescript
<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  {(() => {
    const participantName = findParticipantName(stakeholder.stakeholder_name);
    return participantName ? (
      <Link
        to={`/participant/${encodeURIComponent(participantName)}`}
        className="text-blue-600 hover:text-blue-900"
      >
        View Details →
      </Link>
    ) : null;
  })()}
</td>
```

### 7. Created Shared Name Matching Utility (`src/utils/nameMatching.ts`)
Created a reusable utility module with two functions for bidirectional name matching:

**`findMatchingSentimentStakeholder(participantName, stakeholders)`**
- Used in `ParticipantDetail.tsx` to find sentiment data for a participant
- Takes a full participant name (e.g., "Kunta Kinteh Island & Museum...")
- Returns the best matching sentiment stakeholder object
- Solves the "No Review Data Available" issue on participant detail pages

**`findMatchingParticipantName(stakeholderName, participants)`**
- Used in `ReviewsSentiment.tsx` to generate links from sentiment data to participant pages
- Takes a sentiment stakeholder name (e.g., "kunta_kinteh_island")
- Returns the best matching full participant name
- Enables correct "View Details" links in the reviews table

Both functions use the same scoring algorithm:
- Exact match: 1000 points
- Starts with: 900 points
- Contains: 800 points
- Word-by-word matching: 600 points
- Length bonus for more specific matches

### 8. Updated `ParticipantDetail.tsx` to Use Shared Utility
- Replaced simple string matching with `findMatchingSentimentStakeholder()`
- Now correctly finds sentiment data for participants with complex names
- Example: "Kunta Kinteh Island & Museum (James Island & Albreda Museum / Slavery Museum)" now matches "kunta_kinteh_island"

### 9. Updated `ReviewsSentiment.tsx` to Use Shared Utility
- Removed duplicate matching logic (60+ lines)
- Now calls `findMatchingParticipantName()` from shared utility
- Maintains same functionality with cleaner, maintainable code

## Result
- ✅ Regional competitors tab now loads successfully without crashes
- ✅ Displays "N/A" for management response rate in the table (since data doesn't exist)
- ✅ Hides the "Management Response Opportunity" insight section for regional tab
- ✅ Creative industries and tour operators tabs continue to work with their response rate data
- ✅ "View Details" links now correctly map to participant pages using smart fuzzy matching
- ✅ Links only appear when a matching participant is found (no broken 404 links)
- ✅ Handles name variations automatically (e.g., `senegambia_craft_market` → `Serrekunda (Senegambia) Craft Market`)
- ✅ Regional competitors (non-Gambian) stakeholders don't show links (as expected, since they're not in the participants list)
- ✅ **Participant detail pages now correctly load and display review data** (e.g., "Kunta Kinteh Island & Museum..." shows its 24 reviews)
- ✅ Code is now DRY (Don't Repeat Yourself) with a single source of truth for name matching logic
- ✅ Future maintenance is easier - updates to matching algorithm only need to be made in one place

## Data Structure Reference

**Creative Industries & Tour Operators:**
```json
{
  "stakeholder_name": "...",
  "management_response_rate": 0.0,
  "management_response": {
    "response_rate": 0.0,
    "total_responses": 0,
    "total_reviews": 12,
    "gap_opportunity": 12
  }
}
```

**Regional Competitors:**
```json
{
  "stakeholder_name": "...",
  "country": "Benin",
  "sector": "Cultural heritage sites/museums",
  // NO management_response or management_response_rate fields
}
```

