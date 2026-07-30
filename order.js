import { db } from "./firebase.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"; // <-- 1. EI LINE ADD
import { ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const auth = getAuth(); // <-- 2. EI LINE ADD

let currentRates = {};
let exchangeData = {};
let currentUserId = "guest"; // <-- 3. EI LINE ADD

// User login thakle userId niye rakhbo
onAuthStateChanged(auth, (user) => { // <-- 4. EI BLOCK ADD
  if (user) {
    currentUserId = user.uid;
  } else {
    currentUserId = "guest";
  }
});

// Wallet Key to Name
function getWalletName(key){
    const names = {
        usdt:"USDT", payoneer:"Payoneer", wise:"Wise", skrill:"Skrill",
        bkash:"Bkash", nagad:"Nagad", rocket:"Rocket", upay:"Upay"
    };
    return names[key] || key;
}

// 1. localStorage থেকে index.html এর Data নেয়া
window.addEventListener('DOMContentLoaded', () => {
    exchangeData = JSON.parse(localStorage.getItem('exchangeData'));

    if(!exchangeData){
        alert("Please select amount first from home page");
        window.location.href = 'index.html';
        return;
    }

    // Summary Box Show
    document.getElementById('orderSummary').style.display = 'block';
    document.getElementById('sendWallet').value = getWalletName(exchangeData.send.wallet);
    document.getElementById('sendAmount').value = exchangeData.send.amount;
    document.getElementById('getWallet').value = getWalletName(exchangeData.get.wallet);
    document.getElementById('getAmount').value = exchangeData.get.amount + ' BDT';

    // FIXED LINE
    document.getElementById('summarySend').innerText = exchangeData.send.amount + ' ' + getWalletName(exchangeData.send.wallet);
    document.getElementById('summaryGet').innerText = exchangeData.get.amount + ' BDT to ' + getWalletName(exchangeData.get.wallet);
});

// 2. Live Rate নিয়ে Calculation
onValue(ref(db, "rates/wallets"), (snapshot) => {
    if (snapshot.exists()) {
        currentRates = snapshot.val();
        calculateBDT();
    }
});

function calculateBDT() {
    if(!exchangeData ||!currentRates) return;

    const sendWallet = exchangeData.send.wallet;
    const getWallet = exchangeData.get.wallet;
    const amount = parseFloat(exchangeData.send.amount) || 0;

    let result = 0;
    // USD to BDT
    if(['usdt','payoneer','wise','skrill'].includes(sendWallet)){
        if(['bkash','nagad','rocket','upay'].includes(getWallet)){
            result = amount * currentRates[sendWallet]?.sell;
        }
    }
    // BDT to USD
    if(['bkash','nagad','rocket','upay'].includes(sendWallet)){
        if(['usdt','payoneer','wise','skrill'].includes(getWallet)){
            result = amount / currentRates[getWallet]?.buy;
        }
    }

    document.getElementById("getAmount").value = result.toFixed(2) + ' BDT';
    document.getElementById('summaryGet').innerText = result.toFixed(2) + ' BDT to ' + getWalletName(getWallet); // summary o update
    exchangeData.get.amount = result.toFixed(2); // Update for submit
}

// 3. Form Submit to Firebase
document.getElementById("orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector("button[type='submit']");
    const submitMsg = document.getElementById('submitMsg');
    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;
    submitMsg.innerHTML = '';

    const orderData = {
        userId: currentUserId, // <-- 5. SUDHU EI LINE ADD KORO
        orderId: "TS" + Date.now(),
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        walletAddress: document.getElementById("walletAddress").value,
        sendWallet: exchangeData.send.wallet,
        getWallet: exchangeData.get.wallet,
        sendAmount: exchangeData.send.amount,
        getAmount: exchangeData.get.amount,
        bdtAmount: exchangeData.get.amount,
        status: "pending", // lowercase রাখলাম dashboard এর সাথে match করার জন্য
        timestamp: Date.now()
    };

    try {
        await set(push(ref(db, "orders")), orderData);
        submitMsg.innerHTML = "✅ Order Submitted Successfully! We will contact you soon.";
        submitMsg.className = "text-success";
        localStorage.removeItem('exchangeData');

        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);

    } catch (error) {
        submitMsg.innerHTML = "❌ Error: " + error.message;
        submitMsg.className = "text-danger";
    }

    submitBtn.innerText = "Confirm & Submit Order";
    submitBtn.disabled = false;
});
