import { db } from "./firebase.js";
import { ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

let currentRates = {};

// 1. URL থেকে Data নেয়া
const params = new URLSearchParams(window.location.search);
const walletFromUrl = params.get("wallet") || "payoneer";
const amountFromUrl = params.get("amount") || "1";

document.getElementById("usdAmount").value = amountFromUrl;

// 2. Live Rate নিয়ে Form Fill
onValue(ref(db, "exchangeRates"), (snapshot) => {
    if (snapshot.exists()) {
        currentRates = snapshot.val();

        // Wallet Dropdown Fill
        const walletSelect = document.getElementById("walletType");
        walletSelect.innerHTML = `
            <option value="payoneer">Payoneer USD</option>
            <option value="wise">Wise USD</option>
            <option value="usdt">USDT</option>
            <option value="skrill">Skrill</option>
        `;
        walletSelect.value = walletFromUrl;

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

// 3. Form Submit to Firebase
document.getElementById("orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector("button[type='submit']");
    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;

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

    try {
        await set(push(ref(db, "orders")), orderData);
        alert("✅ Order Submitted Successfully! We will contact you soon.");
        window.location.href = "index.html";
    } catch (error) {
        alert("❌ Error: " + error.message);
    }

    submitBtn.innerText = "Confirm & Submit Order";
    submitBtn.disabled = false;
});
