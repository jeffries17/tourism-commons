import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  getDoc,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ReviewSession {
  id?: string;
  userId: string;
  name: string;
  reviews: string[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

/**
 * Save a new review session
 */
export async function saveSession(
  userId: string, 
  name: string, 
  reviews: string[]
): Promise<string> {
  const sessionData: Omit<ReviewSession, 'id'> = {
    userId,
    name,
    reviews,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  const docRef = await addDoc(collection(db, 'sentiment_sessions'), sessionData);
  return docRef.id;
}

/**
 * Update an existing review session
 */
export async function updateSession(
  sessionId: string,
  name: string,
  reviews: string[]
): Promise<void> {
  const sessionRef = doc(db, 'sentiment_sessions', sessionId);
  await updateDoc(sessionRef, {
    name,
    reviews,
    updatedAt: Timestamp.now()
  });
}

/**
 * Delete a review session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const sessionRef = doc(db, 'sentiment_sessions', sessionId);
  await deleteDoc(sessionRef);
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(userId: string): Promise<ReviewSession[]> {
  try {
    // Try with orderBy first
    const q = query(
      collection(db, 'sentiment_sessions'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ReviewSession));
  } catch (error: any) {
    // If orderBy fails (missing index), try without it
    if (error.code === 'failed-precondition') {
      const q = query(
        collection(db, 'sentiment_sessions'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ReviewSession));
      
      // Sort manually
      return sessions.sort((a, b) => {
        const aTime = a.updatedAt instanceof Date ? a.updatedAt.getTime() : (a.updatedAt as any).toMillis();
        const bTime = b.updatedAt instanceof Date ? b.updatedAt.getTime() : (b.updatedAt as any).toMillis();
        return bTime - aTime;
      });
    }
    throw error;
  }
}

/**
 * Get a specific session by ID
 */
export async function getSession(sessionId: string): Promise<ReviewSession | null> {
  const sessionRef = doc(db, 'sentiment_sessions', sessionId);
  const sessionDoc = await getDoc(sessionRef);
  
  if (!sessionDoc.exists()) {
    return null;
  }
  
  return {
    id: sessionDoc.id,
    ...sessionDoc.data()
  } as ReviewSession;
}

