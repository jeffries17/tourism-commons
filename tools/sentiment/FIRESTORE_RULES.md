# Firestore Security Rules for Sentiment Analysis

## Required Security Rules

To enable session saving, you need to set up Firestore security rules. Go to Firebase Console → Firestore Database → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sentiment analysis sessions
    match /sentiment_sessions/{sessionId} {
      // Users can read their own sessions
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // Users can create sessions with their own userId
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      
      // Users can update their own sessions
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // Users can delete their own sessions
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Creating Firestore Index (Optional but Recommended)

If you want sessions sorted by `updatedAt`, create a composite index:

1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Collection: `sentiment_sessions`
4. Fields:
   - `userId` (Ascending)
   - `updatedAt` (Descending)
5. Click "Create"

**Note:** The app will work without this index, but it will sort sessions manually instead of using Firestore's orderBy.

## Testing

After setting up rules:
1. Login to the app
2. Add a review
3. Name and save a session
4. Check Firebase Console → Firestore Database → `sentiment_sessions` collection
5. You should see your saved session

