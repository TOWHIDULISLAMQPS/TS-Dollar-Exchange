import { db } from "./firebase.js";
import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// 1. SAVE RATES BUTTON
const saveBtn = document.getElementById("saveRates");
const ordersTable = document.getElementById("ordersTable");

saveBtn.addEventListener("click", async () => {
    saveBtn.innerText = "Saving...";
    saveBtn.disabled = true;

    const rates = {
        payoneer: { 
            buyRate: document.getElementById("payoneerBuy").value, 
            sellRate: document.getElementById("payoneerSell").value 
        },
        wise: { 
            buyRate: document.getElementById("wiseBuy").value, 
            sellRate: document.getElementById("wiseSell").value 
        },
        usdt: { 
            buyRate: document.getElementById("usdtBuy").value, 
            sellRate: document.getElementById("usdtSell").value 
        },
        skrill: { 
            buyRate: document.getElementById("skrillBuy").value, 
            sellRate: document.getElementById("skrillSell").value 
        }
    };
    
    try {
        await set(ref(db, "exchangeRates"), rates);
        alert("✅ All Rates Saved Successfully!");
    } catch (error) {
        alert("❌ Error: " + error.message);
    }

    saveBtn.innerText = "Save All Rates";
    saveBtn.disabled = false;
});

// 2. LOAD EXISTING RATES WHEN ADMIN PAGE OPENS
function loadExistingRates() {
    onValue(ref(db, "exchangeRates"), (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            
            if(data.payoneer){
                document.getElementById("payoneerBuy").value = data.payoneer.buyRate;
                document.getElementById("payoneerSell").value = data.payoneer.sellRate;
            }
            if(data.wise){
                document.getElementById("wiseBuy").value = data.wise.buyRate;
                document.getElementById("wiseSell").value = data.wise.sellRate;
            }
            if(data.usdt){
                document.getElementById("usdtBuy").value = data.usdt.buyRate;
                document.getElementById("usdtSell").value = data.usdt.sellRate;
            }
            if(data.skrill){
                document.getElementById("skrillBuy").value = data.skrill.buyRate;
                document.getElementById("skrillSell").value = data.skrill.sellRate;
            }
        }
    });
}
loadExistingRates();

// 3. LOAD ORDERS IN REALTIME
onValue(ref(db, "orders"), (snapshot) => {
    ordersTable.innerHTML = "";
    
    if (!snapshot.exists()) {
        ordersTable.innerHTML = `<tr><td colspan="6" class="text-center">No orders yet</td></tr>`;
        return;
    }

    snapshot.forEach(child => {
        const order = child.val();
        let badgeColor = "bg-warning";
        if(order.status === "Completed") badgeColor = "bg-success";
        if(order.status === "Cancelled") badgeColor = "bg-danger";

        ordersTable.innerHTML += `
        <tr>
            <td>${order.orderId || 'N/A'}</td>
            <td>${order.name || 'N/A'}</td>
            <td>${order.wallet || 'N/A'}</td>
            <td>${order.amount || '0'} USD</td>
            <td>${order.bdtAmount || '0'} BDT</td>
            <td><span class="badge ${badgeColor}">${order.status || 'Pending'}</span></td>
        </tr>`;
    });
});

console.log("✅ Admin JS Loaded");
