import { db } from "./firebase.js";

import {
    ref,
    get,
    set,
    update,
    onValue
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";


// ===============================
// DOM
// ===============================

// Exchange Rate
const wallet = document.getElementById("wallet");
const buyRate = document.getElementById("buyRate");
const sellRate = document.getElementById("sellRate");

const message = document.getElementById("message");
const lastUpdate = document.getElementById("lastUpdate");

// Dashboard
const totalOrders = document.getElementById("totalOrders");
const pendingOrders = document.getElementById("pendingOrders");
const completedOrders = document.getElementById("completedOrders");
const cancelledOrders = document.getElementById("cancelledOrders");

// Orders
const ordersTable = document.getElementById("ordersTable");

const searchOrder = document.getElementById("searchOrder");
const statusFilter = document.getElementById("statusFilter");
const refreshBtn = document.getElementById("refreshBtn");

// Modal Buttons
const releaseBtn = document.getElementById("releaseBtn");
const cancelBtn = document.getElementById("cancelBtn");

// Live Status
const liveStatus = document.getElementById("liveStatus");


// ===============================
// Variables
// ===============================

let ordersData = [];

let selectedOrderId = "";


// ===============================
// Console
// ===============================

console.log("TS Dollar Exchange Admin");
console.log("Part 1 Loaded Successfully");
// ======================================
// SAVE RATE
// ======================================

window.saveRate = async function () {

    const buy = buyRate.value.trim();
    const sell = sellRate.value.trim();

    if (buy === "" || sell === "") {

        message.innerHTML = "❌ Please enter Buy & Sell Rate";
        message.style.color = "red";
        return;

    }

    try {

        const data = {

            wallet: wallet.value,
            buyRate: Number(buy),
            sellRate: Number(sell),
            updatedAt: new Date().toLocaleString()

        };

        await set(
            ref(db, "exchangeRates/" + wallet.value),
            data
        );

        message.innerHTML = "✅ Rate Saved Successfully";
        message.style.color = "green";

        lastUpdate.innerHTML =
            "Last Update : " + data.updatedAt;

    }

    catch (error) {

        console.error(error);

        message.innerHTML = "❌ Save Failed";
        message.style.color = "red";

    }

};


// ======================================
// LOAD RATE
// ======================================

async function loadRate() {

    try {

        const snapshot = await get(
            ref(db, "exchangeRates/" + wallet.value)
        );

        if (snapshot.exists()) {

            const data = snapshot.val();

            buyRate.value = data.buyRate;
            sellRate.value = data.sellRate;

            lastUpdate.innerHTML =
                "Last Update : " + data.updatedAt;

        }

        else {

            buyRate.value = "";
            sellRate.value = "";
            lastUpdate.innerHTML = "";

        }

    }

    catch (error) {

        console.error(error);

    }

}


// ======================================
// Wallet Change
// ======================================

wallet.addEventListener("change", loadRate);


// ======================================
// Initial Load
// ======================================

loadRate();

console.log("Part 2 Loaded Successfully");
// ======================================
// LOAD ORDERS FROM FIREBASE
// ======================================

const ordersRef = ref(db, "orders");

onValue(ordersRef, (snapshot) => {

    ordersData = [];

    if (snapshot.exists()) {

        snapshot.forEach((child) => {

            const order = child.val();

            ordersData.push({
                ...order,
                firebaseKey: child.key
            });

        });

    }

    renderOrders();

});


// ======================================
// RENDER ORDERS
// ======================================

function renderOrders() {

    ordersTable.innerHTML = "";

    let total = 0;
    let pending = 0;
    let completed = 0;
    let cancelled = 0;

    let keyword = "";

    if (searchOrder) {
        keyword = searchOrder.value.toLowerCase().trim();
    }

    let filter = "all";

    if (statusFilter) {
        filter = statusFilter.value;
    }

    if (ordersData.length === 0) {

        ordersTable.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">
                No Orders Found
            </td>
        </tr>
        `;

    }

    let serial = 1;

    ordersData.forEach((order) => {

        const status = order.status || "Pending";

        total++;

        if (status === "Pending") pending++;
        if (status === "Released") completed++;
        if (status === "Rejected") cancelled++;

        if (
            keyword &&
            !(order.name || "").toLowerCase().includes(keyword) &&
            !(order.orderId || "").toLowerCase().includes(keyword)
        ) {
            return;
        }

        if (filter !== "all" && status !== filter) {
            return;
        }

        let badge = "warning";

        if (status === "Released") badge = "success";
        if (status === "Rejected") badge = "danger";

        ordersTable.innerHTML += `

<tr>

<td>${serial++}</td>

<td>${order.orderId || "-"}</td>

<td>${order.name || "-"}</td>

<td>${order.wallet || "-"}</td>

<td>${order.amount || "-"}</td>

<td>

<span class="badge bg-${badge}">
${status}
</span>

</td>

<td>${order.date || "-"}</td>

<td>

<button
class="btn btn-primary btn-sm"
onclick="viewOrder('${order.orderId}')">

View

</button>

</td>

</tr>

`;

    });

    totalOrders.innerHTML = total;
    pendingOrders.innerHTML = pending;
    completedOrders.innerHTML = completed;
    cancelledOrders.innerHTML = cancelled;

}

console.log("Part 3 Loaded Successfully");
// ======================================
// SEARCH
// ======================================

if (searchOrder) {

    searchOrder.addEventListener("input", () => {

        renderOrders();

    });

}


// ======================================
// STATUS FILTER
// ======================================

if (statusFilter) {

    statusFilter.addEventListener("change", () => {

        renderOrders();

    });

}


// ======================================
// REFRESH
// ======================================

if (refreshBtn) {

    refreshBtn.addEventListener("click", () => {

        loadRate();

        renderOrders();

    });

}


// ======================================
// VIEW ORDER
// ======================================

window.viewOrder = function (orderId) {

    selectedOrderId = orderId;

    const order = ordersData.find(item => item.orderId === orderId);

    if (!order) return;

    document.getElementById("mOrderId").innerHTML = order.orderId || "-";
    document.getElementById("mCustomer").innerHTML = order.name || "-";
    document.getElementById("mPhone").innerHTML = order.phone || "-";
    document.getElementById("mWallet").innerHTML = order.wallet || "-";
    document.getElementById("mAmount").innerHTML = order.amount || "-";
    document.getElementById("mReceiveMethod").innerHTML = order.receiveMethod || "-";
    document.getElementById("mReceiveAccount").innerHTML = order.receiveAccount || "-";
    document.getElementById("mTrx").innerHTML = order.trxId || "-";
    document.getElementById("mStatus").innerHTML = order.status || "Pending";
    document.getElementById("mDate").innerHTML = order.date || "-";

    const modal = new bootstrap.Modal(
        document.getElementById("orderModal")
    );

    modal.show();

};

console.log("✅ Part 4 Loaded");
// ======================================
// RELEASE ORDER
// ======================================

if (releaseBtn) {

    releaseBtn.addEventListener("click", async () => {

        if (!selectedOrderId) return;

        const order = ordersData.find(
            item => item.orderId === selectedOrderId
        );

        if (!order) return;

        try {

            await update(
                ref(db, "orders/" + order.firebaseKey),
                {
                    status: "Released"
                }
            );

            alert("✅ Order Released Successfully");

            bootstrap.Modal.getInstance(
                document.getElementById("orderModal")
            ).hide();

        } catch (error) {

            console.error(error);

            alert("❌ Failed to Release Order");

        }

    });

}


// ======================================
// REJECT ORDER
// ======================================

if (cancelBtn) {

    cancelBtn.addEventListener("click", async () => {

        if (!selectedOrderId) return;

        const order = ordersData.find(
            item => item.orderId === selectedOrderId
        );

        if (!order) return;

        try {

            await update(
                ref(db, "orders/" + order.firebaseKey),
                {
                    status: "Rejected"
                }
            );

            alert("❌ Order Rejected Successfully");

            bootstrap.Modal.getInstance(
                document.getElementById("orderModal")
            ).hide();

        } catch (error) {

            console.error(error);

            alert("❌ Failed to Reject Order");

        }

    });

}

console.log("✅ Part 5 Loaded Successfully");
// ======================================
// LIVE CLOCK
// ======================================

function updateLiveClock() {

    if (!liveStatus) return;

    liveStatus.innerHTML =
        "🟢 LIVE • " + new Date().toLocaleTimeString();

}

updateLiveClock();

setInterval(updateLiveClock, 1000);


// ======================================
// AUTO REFRESH
// ======================================

setInterval(() => {

    loadRate();
    renderOrders();

}, 10000);


// ======================================
// PAGE LOAD
// ======================================

window.addEventListener("load", () => {

    loadRate();
    renderOrders();

});


// ======================================
// GLOBAL ERROR
// ======================================

window.addEventListener("error", (e) => {

    console.error("Admin Error :", e.message);

});


// ======================================
// FIREBASE CONNECTION CHECK
// ======================================

get(ref(db, ".info/connected"))

.then((snapshot) => {

    if (snapshot.exists()) {

        console.log("✅ Firebase Connected");

    }

})

.catch((err) => {

    console.error(err);

});


// ======================================
// END
// ======================================

console.log("================================");
console.log("TS Dollar Exchange Admin Loaded");
console.log("Version : 2.0");
console.log("================================");
// ======================================
// SUCCESS MESSAGE AUTO HIDE
// ======================================

function showMessage(text, color = "green") {

    message.innerHTML = text;
    message.style.color = color;

    setTimeout(() => {

        message.innerHTML = "";

    }, 3000);

}


// ======================================
// LIVE FIREBASE CONNECTION
// ======================================

onValue(ref(db, ".info/connected"), (snap) => {

    if (!liveStatus) return;

    if (snap.val() === true) {

        liveStatus.innerHTML = "🟢 LIVE";

        liveStatus.classList.remove("bg-danger");
        liveStatus.classList.add("bg-success");

    } else {

        liveStatus.innerHTML = "🔴 OFFLINE";

        liveStatus.classList.remove("bg-success");
        liveStatus.classList.add("bg-danger");

    }

});


// ======================================
// PREVENT DOUBLE CLICK SAVE
// ======================================

const saveBtn = document.querySelector(".btn-save");

if (saveBtn) {

    saveBtn.addEventListener("click", () => {

        saveBtn.disabled = true;

        setTimeout(() => {

            saveBtn.disabled = false;

        }, 2000);

    });

}

console.log("✅ Bonus Features Loaded");
