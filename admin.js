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

// Login local e save rakbe
setPersistence(auth, browserLocalPersistence);

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
let retryCount = 0;

// ===========================
// 1. LOGIN SYSTEM WITH RETRY
// ===========================
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

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

async function tryLogin(email, password, btn){
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showDashboard();
    } catch (error) {
        console.error("Login Error:", error.code);
        retryCount++;

        if(error.code === "auth/network-request-failed" && retryCount < 3){
            loginError.innerText = `❌ Network Error! Retrying ${retryCount}/3...`;
            setTimeout(() => tryLogin(email, password, btn), 2000);
        } else if(error.code === "auth/network-request-failed"){
            loginError.innerText = "❌ Network Error! Firebase > Authentication > Settings > Authorized domains e apnar site add korun.";
        } else if(error.code === "auth/invalid-credential"){
            loginError.innerText = "❌ Email or Password vul.";
        } else {
            loginError.innerText = "❌ " + error.message;
        }
        btn.innerText = "Login";
        btn.disabled = false;
    }
}

// ===========================
// 2. SHOW/HIDE PAGES
// ===========================
function showDashboard(){
    loginPage.style.display = "none";
    dashboardPage.style.display = "block";
    loadRates();
}

function showLogin(){
    loginPage.style.display = "block";
    dashboardPage.style.display = "none";
}

// ===========================
// 3. LOGOUT
// ===========================
document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    showLogin();
});

// ===========================
// 4. CHECK LOGIN STATUS
// ===========================
onAuthStateChanged(auth, (user) => {
    if(user){
        showDashboard();
    } else {
        showLogin();
    }
});

// ===========================
// 5. LOAD & UPDATE RATES
// ===========================
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

document.getElementById("rateForm").addEventListener("submit", async (e) => {
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
