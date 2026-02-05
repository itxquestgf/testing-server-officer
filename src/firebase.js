import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeereh6lZqNSNHGGMIGq7nzBIfGMBu7uw",
  authDomain: "officer-progress-90bfd.firebaseapp.com",
  databaseURL: "https://officer-progress-90bfd-default-rtdb.firebaseio.com",
  projectId: "officer-progress-90bfd",
  storageBucket: "officer-progress-90bfd.firebasestorage.app",
  messagingSenderId: "745097143170",
  appId: "1:745097143170:web:e00a25f702031cae48e59b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// export const db = getDatabase(app);
export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };