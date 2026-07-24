import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyD8qHA0sp4pWlzN-4z65o-t6mSz3dm-0UU",
  authDomain: "hindtraders-e386b.firebaseapp.com",
  projectId: "hindtraders-e386b",
  storageBucket: "hindtraders-e386b.firebasestorage.app",
  messagingSenderId: "711337641799",
  appId: "1:711337641799:web:36dfaf84cc9d9444a46e62",
  measurementId: "G-99WKLS9D7W"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
