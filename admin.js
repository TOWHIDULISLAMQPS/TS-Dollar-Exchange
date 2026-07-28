import { auth, db } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    ref,
    onValue,
    update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Local এ Login save রাখবে যাতে বারবার Login না লাগে
setPersistence(auth, browserLocalPersistence);

let retryCount = 0;

// LOGIN SYSTEM
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

if(loginForm){
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const btn = document.getElementById("loginBtn");

        btn.innerText = "Logging in...";
        btn.disabled = true;
        loginError.innerText = "";
        retryCount = 0;

        await tryLogin(email, password, btn);
    });
}

async function tryLogin(email, password, btn){
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Login Error:", error.code);
        retryCount++;

        if(error.code === "auth/network-request-failed" && retryCount < 3){
            loginError.innerText = `❌ Network Error! Retrying ${retryCount}/3...`;
            setTimeout(() => tryLogin(email, password, btn), 2000); // 2 sec পর আবার Try
        } else if(error.code === "auth/network-request-failed"){
            loginError.innerText = "❌ Network Error! Firebase BD থেকে Block করতেছে। Authorized domain add করুন অথবা একটু পর Try করুন।";
        } else if(error.code === "auth/invalid-credential"){
            loginError.innerText = "❌ Email or Password vul.";
        } else {
            loginError.innerText = "❌ " + error.message;
        }
    }
    btn.innerText = "Login";
    btn.disabled = false;
}

// LOGOUT
const logoutBtn = document.getElementById("logoutBtn");
if(logoutBtn){
    logoutBtn.addEventListener("click", async () => {
        await signOut(auth);
        window.location.href = "admin.html";
    });
}

// CHECK LOGIN
onAuthStateChanged(auth, (user) => {
    if(!user && window.location.pathname.includes("dashboard.html")){
        window.location.href = "admin.html";
    }
    if(user && window.location.pathname.includes("admin.html")){
        window.location.href = "dashboard.html";
    }
});

// LOAD & UPDATE RATES
const ratesRef = ref(db, "exchangeRates");
function loadRates(){
    onValue(ratesRef, (snapshot) => {
        if(snapshot.exists()){
            const rates = snapshot.val();
            for(const wallet in rates){
                if(document.getElementById(`${wallet}Buy`)){
                    document.getElementById(`${wallet}Buy`).value = rates[wallet].buyRate || 0;
                }
                if(document.getElementById(`${wallet}Sell`)){
                    document.getElementById(`${wallet}Sell`).value = rates[wallet].sellRate || 0;
                }
            }
        }
    });
}

const rateForm = document.getElementById("rateForm");
if(rateForm){
    loadRates();
    rateForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("updateBtn");
        btn.innerText = "Updating...";
        btn.disabled = true;

        const updatedRates = {
            payoneer: { buyRate: parseFloat(document.getElementById("payoneerBuy").value), sellRate: parseFloat(document.getElementById("payoneerSell").value) },
            wise: { buyRate: parseFloat(document.getElementById("wiseBuy").value), sellRate: parseFloat(document.getElementById("wiseSell").value) },
            usdt: { buyRate: parseFloat(document.getElementById("usdtBuy").value), sellRate: parseFloat(document.getElementById("usdtSell").value) },
            skrill: { buyRate: parseFloat(document.getElementById("skrillBuy").value), sellRate: parseFloat(document.getElementById("skrillSell").value) }
        };
        await update(ratesRef, updatedRates);
        alert("✅ Rates Updated Successfully!");
        btn.innerText = "Update Rates";
        btn.disabled = false;
    });
}
