import { db } from "./firebase.js";
import { ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

let currentRates = {};

// 1. URL থেকে Data নিয়ে Form Fill করা
const params = new URLSearchParams(window.location.search);
document.getElementById("walletType").value = params.get("wallet") || "payoneer";
document.getElementById("usdAmount").value = params.get("amount") || "1";

// 2. Live Rate নিয়ে BDT হিসাব
onValue(ref(db, "exchangeRates"), (snapshot) => {
    if (snapshot.exists()) {
        currentRates = snapshot.val();
        calculateBDT();
    }
});

function calculateBDT() {
    const amount = parseFloat(document.getElementById("usdAmount").value) || 0;
    const wallet = document.getElementById("walletType").value;
    if(amount > 0 && currentRates[wallet]){
        const rate = parseFloat(currentRates[wallet].buyRate?.toString()) || 0;
        document.getElementById("resultBDT").value = `${(amount * rate).toFixed(2)} BDT`;
    }
}

// 3. Form Submit
document.getElementById("orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const orderData = {
        orderId: "TS" + Date.now(),
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        wallet: document.getElementById("walletType").value,
        amount: document.getElementById("usdAmount").value,
        bdtAmount: document.getElementById("resultBDT").value,
        walletAddress: document.getElementById("walletAddress").value,
        status: "Pending",
        timestamp: Date.now()
    };
    await set(push(ref(db, "orders")), orderData);
    alert("✅ Order Submitted Successfully!");
    window.location.href = "index.html"; // Submit এর পর Home এ পাঠাবে
});
