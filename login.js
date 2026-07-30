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

// Firebase Start v8
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// 1. ADMIN EMAIL LIST - ekhane apnar admin email gula din
const ADMIN_EMAILS = ["towhidul.islam@gmail.com", "admin@tsdollar.com"]; // <-- CHANGE KORE NIN

function login() {
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;
const msg = document.getElementById('msg');

if(!email || !password){
msg.innerHTML = "Please enter Email and Password";
msg.className = "text-warning text-center mt-3";
return;
}

msg.innerHTML = "Logging in...";
msg.className = "text-info text-center mt-3";

auth.signInWithEmailAndPassword(email, password)
.then((userCredential) => {
const user = userCredential.user; // <-- EI LINE ADD

// 2. ADMIN CHECK
if(ADMIN_EMAILS.includes(user.email)){ // <-- EI IF ADD
msg.innerHTML = "Admin Login Success! Redirecting...";
msg.className = "text-success text-center mt-3";
setTimeout(() => {
window.location.href = "dashboard.html"; 
}, 1500);
}else{ // <-- EI ELSE ADD
msg.innerHTML = "❌ This account is not Admin. Please use Customer Login.";
msg.className = "text-danger text-center mt-3";
auth.signOut(); // customer ke logout kore dibe
} // <-- EI BRACKET ADD
})
.catch((error) => {
msg.innerHTML = "Error: " + error.message;
msg.className = "text-danger text-center mt-3";
});
}
