// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7zYoT3-Zy5YqqzZyU--Uk7FxFTyyR9LI",
  authDomain: "resapp-fb431.firebaseapp.com",
  projectId: "resapp-fb431",
  storageBucket: "resapp-fb431.appspot.com",
  messagingSenderId: "631011241166",
  appId: "1:631011241166:web:63f68629403145e912349f"
};

// Initialize Firebase
const app  = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db , app ,auth};
//export const FIRESTORE_DB = getFirestore(FIREBASE_APP);