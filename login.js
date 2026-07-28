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
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
window.login = () => {
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;
const msg = document.getElementById('msg');
if(!email || !password){msg.innerHTML = "Please enter Email and Password";msg.className = "text-warning text-center mt-3";return;}
msg.innerHTML = "Logging in...";msg.className = "text-info text-center mt-3";
signInWithEmailAndPassword(auth, email, password)
.then((userCredential) => {
msg.innerHTML = "Login Success! Redirecting...";msg.className = "text-success text-center mt-3";
setTimeout(() => {window.location.href = "dashboard.html";}, 1500);
})
.catch((error) => {msg.innerHTML = "Error: " + error.message;msg.className = "text-danger text-center mt-3";});
}
