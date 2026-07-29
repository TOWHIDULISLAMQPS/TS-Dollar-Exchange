import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey:"AIzaSyBC0OA7gEWg1dfVzqVpI1YgbKzNKllz4pg",
  authDomain:"ts-dollar-exchange.firebaseapp.com",
  databaseURL:"https://ts-dollar-exchange-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:"ts-dollar-exchange"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
