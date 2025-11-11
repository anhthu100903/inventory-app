//npm install firebase react-router-dom

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARp9yVDwTI9sFhczG_T31jAdWKVRBKwLw",
  authDomain: "inventory-system-b67c2.firebaseapp.com",
  projectId: "inventory-system-b67c2",
  storageBucket: "inventory-system-b67c2.firebasestorage.app",
  messagingSenderId: "504582935589",
  appId: "1:504582935589:web:f46bb1efa2e74105b71bcc",
  measurementId: "G-82HK6THE2N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);