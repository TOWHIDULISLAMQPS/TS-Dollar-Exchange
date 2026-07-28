// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBC0OA7gEWg1dfVzqVpI1YgbKzNKllz4pg",
  authDomain: "ts-dollar-exchange.firebaseapp.com",
  databaseURL: "https://ts-dollar-exchange-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ts-dollar-exchange",
  storageBucket: "ts-dollar-exchange.firebasestorage.app",
  messagingSenderId: "458864027860",
  appId: "1:458864027860:web:adfe8163cbe6bddfbfb341",
  measurementId: "G-1SHL91C6Z0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Export so other files can use it
export { app, db, auth };
