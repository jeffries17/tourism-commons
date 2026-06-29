# Firebase Setup for Sentiment Analysis Tool

## ✅ Already Configured!

The sentiment analysis tool uses the **existing Firebase project** (`tourism-development-d620c`) that's already set up for Tourism Commons. The Firebase config has been automatically configured using the same project.

## What's Already Set Up

- ✅ **Firebase Project**: `tourism-development-d620c`
- ✅ **Firebase Config**: Automatically configured in `src/config/firebase.ts`
- ✅ **Firebase Hosting**: Already deployed
- ✅ **Firebase Functions**: Already set up

## What You May Need to Enable

1. **Firebase Authentication Methods** (if not already enabled):
   - Go to [Firebase Console](https://console.firebase.google.com/project/tourism-development-d620c/authentication/providers)
   - Enable "Email/Password" if not already enabled
   - Enable "Google" if not already enabled
   - Add authorized domains if needed (tourismcommons.org, tourismcommons.com)

2. **Firestore Database** (if not already set up):
   - Go to [Firestore Database](https://console.firebase.google.com/project/tourism-development-d620c/firestore)
   - Create database if it doesn't exist
   - The `sentiment_sessions` collection will be created automatically when users save sessions

## Security Rules (Firestore)

For production, set up proper security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sentiment_sessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Testing

After setup:
1. Run `npm run dev`
2. Click "Login / Sign Up" in header
3. Try creating an account with email/password
4. Try logging in with Google
5. Toggle "Multiple Reviews" mode - should show login prompt if not authenticated

