// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRKQdUsGU4tz5Vd59mhzz_6VLkX4F6kVI",
  authDomain: "techitik.firebaseapp.com",
  databaseURL: "https://techitik-default-rtdb.firebaseio.com",
  projectId: "techitik",
  storageBucket: "techitik.firebasestorage.app",
  messagingSenderId: "849407356541",
  appId: "1:849407356541:web:7cfca78a7f083740ba4b14",
  measurementId: "G-32N8JH7V88",
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
