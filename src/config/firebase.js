// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "techitik.firebaseapp.com",
  projectId: "techitik",
  storageBucket: "techitik.firebasestorage.app",
  messagingSenderId: "849407356541",
  appId: "1:849407356541:web:b36cf2f17256969dba4b14",
  measurementId: "G-N22P3YB51C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Suggests to Google to only allow sign-ins from this domain
googleProvider.setCustomParameters({
  hd: "paterostechnologicalcollege.edu.ph",
});

export { auth, googleProvider };
