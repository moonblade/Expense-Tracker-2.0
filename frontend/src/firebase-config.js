// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCRlW-k8YjA3NvjL9kT8YnRxwedg8Eh0-s",
  authDomain: "expense-tracker-mb.firebaseapp.com",
  projectId: "expense-tracker-mb",
  storageBucket: "expense-tracker-mb.firebasestorage.app",
  messagingSenderId: "915944312872",
  appId: "1:915944312872:web:29a6480d1808dc9182251d",
  measurementId: "G-2VL2VEJM81"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

