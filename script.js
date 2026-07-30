import { db } from "./firebase.js";
import { ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

console.log("✅ TS Dollar Script Loaded");

// 1. GLOBAL VARIABLE FOR RATES
let currentRates = {
    payoneer: { buyRate: "0", sellRate: "0" },
    wise: { buyRate: "0", sellRate: "0" },
    usdt: { buyRate: "0", sellRate: "0" },
    skrill: { buyRate: "0", sellRate: "0" }
};

// 2. LIVE RATE UPDATE FROM FIREBASE
// Admin থেকে Save করলে এটা অটো Update হবে
onValue(ref(db, "exchangeRates"), (snapshot) => {
    if (snapshot.exists()) {
        currentRates = snapshot.val();
        updateRateUI(currentRates);
        calculateBDT();
        console.log("Rates Updated:", currentRates);
    }
});

// UI তে Rate Show করার Function - FIXED
function updateRateUI(rates) {
    //.toString() করে দিলাম যাতে Number আসলেও Error না দেয়
    if(document.getElementById("payoneerBuy")) document.getElementById("payoneerBuy").innerText = rates.payoneer?.buyRate?.toString() || "0";
    if(document.getElementById("payoneerSell")) document.getElementById("payoneerSell").innerText = rates.payoneer?.sellRate?.toString() || "0";
    if(document.getElementById("wiseBuy")) document.getElementById("wiseBuy").innerText = rates.wise?.buyRate?.toString() || "0";
    if(document.getElementById("wiseSell")) document.getElementById("wiseSell").innerText = rates.wise?.sellRate?.toString() || "0";
    if(document.getElementById("usdtBuy")) document.getElementById("usdtBuy").innerText = rates.usdt?.buyRate?.toString() || "0";
    if(document.getElementById("usdtSell")) document.getElementById("usdtSell").innerText = rates.usdt?.sellRate?.toString() || "0";
    if(document.getElementById("skrillBuy")) document.getElementById("skrillBuy").innerText = rates.skrill?.buyRate?.toString() || "0";
    if(document.getElementById("skrillSell")) document.getElementById("skrillSell").innerText = rates.skrill?.sellRate?.toString() || "0";
}

// 3. CALCULATOR LOGIC - FIXED
const amountInput = document.getElementById("usdAmount");
const walletSelect = document.getElementById("walletType");
const resultText = document.getElementById("resultBDT");

function calculateBDT() {
    const amount = parseFloat(amountInput?.value) || 0;
    const wallet = walletSelect?.value;
    if(amount > 0 && wallet && currentRates[wallet]){
        // এখানেও.toString() করে Number বানাই নিলাম
        const rate = parseFloat(currentRates[wallet].buyRate?.toString()) || 0;
        const totalBDT = amount * rate;
        if(resultText) resultText.innerText = `${totalBDT.toFixed(2)} BDT`;
    } else {
        if(resultText) resultText.innerText = "0.00 BDT";
    }
}

if(amountInput) amountInput.addEventListener("input", calculateBDT);
if(walletSelect) walletSelect.addEventListener("change", calculateBDT);

// 4. ORDER FORM SUBMIT TO FIREBASE
const orderForm = document.getElementById("orderForm");

if(orderForm){
    orderForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = orderForm.querySelector("button[type='submit']");
        submitBtn.innerText = "Submitting...";
        submitBtn.disabled = true;

        const orderData = {
            orderId: "TS" + Date.now(),
            name: document.getElementById("name")?.value,
            email: document.getElementById("email")?.value,
            wallet: document.getElementById("walletType")?.value,
            amount: document.getElementById("usdAmount")?.value,
            bdtAmount: resultText?.innerText,
            walletAddress: document.getElementById("walletAddress")?.value,
            status: "Pending",
            timestamp: Date.now()
        };

        try {
            const newOrderRef = push(ref(db, "orders"));
            await set(newOrderRef, orderData);
            alert("✅ Order Submitted Successfully! We will contact you soon.");
            orderForm.reset();
            if(resultText) resultText.innerText = "0.00 BDT";
        } catch (error) {
            alert("❌ Error: " + error.message);
        }

        submitBtn.innerText = "Submit Order";
        submitBtn.disabled = false;
    });
}
