import { initializeApp, FirebaseApp } from 'firebase/app';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFirestore, Firestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

// Auth removed from here for now -- it's deferred on the backend too
// (see DevUserFilter), so there's no Firebase Auth session to manage on
// this side either. Storage (photos) and Firestore (chat) stay: neither
// depends on auth being wired up, per earlier decisions. Add back
// getAuth/firebaseAuth() here when real auth returns.

let firebaseApp: FirebaseApp | null = null;
let storage: FirebaseStorage | null = null;
let firestore: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp = initializeApp(environment.firebase);
  }
  return firebaseApp;
}

export function firebaseStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
  }
  return storage;
}

export function firebaseDb(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }
  return firestore;
}
