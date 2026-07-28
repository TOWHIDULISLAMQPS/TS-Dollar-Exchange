import { db } from "./firebase.js";

import {
    ref,
    set,
    get,
    onValue,
    update
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

// ======================================
// DOM
// ======================================

const wallet = document.getElementById("wallet");
const buyRate = document.getElementById("buyRate");
const sellRate = document.getElementById("sellRate");

const message = document.getElementById("message");
const lastUpdate = document.getElementById("lastUpdate");

const totalOrders = document.getElementById("totalOrders");
const pendingOrders = document.getElementById("pendingOrders");
const completedOrders = document.getElementById("completedOrders");
const cancelledOrders = document.getElementById("cancelledOrders");

const ordersTable = document.getElementById("ordersTable");

const searchOrder = document.getElementById("searchOrder");
const statusFilter = document.getElementById("statusFilter");
const refreshBtn = document.getElementById("refreshBtn");

const releaseBtn = document.getElementById("releaseBtn");
const cancelBtn = document.getElementById("cancelBtn");

let ordersData = [];
let selectedOrderId = "";

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

wallet.addEventListener("change", loadRate);

loadRate();

console.log("✅ Part 1 Loaded");
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
        id: order.orderId,
        firebaseKey: child.key,
        ...order
    });

});

// ======================================
// RENDER ORDERS TABLE
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

            <td colspan="8" class="text-center py-4">

                No Orders Available

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
            !order.id.toLowerCase().includes(keyword)
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

<td>${order.id}</td>

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

onclick="viewOrder('${order.id}')">

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

console.log("✅ Part 2 Loaded");
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
// REFRESH BUTTON
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

window.viewOrder = function (id) {

    selectedOrderId = id;

    const order = ordersData.find(item => item.id === id);

    if (!order) return;

    document.getElementById("mOrderId").innerHTML = id;
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

console.log("✅ Part 3 Loaded");
// ======================================
// RELEASE ORDER
// ======================================

if (releaseBtn) {

    releaseBtn.addEventListener("click", async () => {

        if (!selectedOrderId) return;

        try {

            await update(
               ref(db, "orders/" + order.firebaseKey)
                {
                    status: "Released"
                }
            );

            alert("✅ Order Released");

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

        try {

            await update(
                ref(db, "orders/" + order.firebaseKey)
                {
                    status: "Rejected"
                }
            );

            alert("❌ Order Rejected");

            bootstrap.Modal.getInstance(
                document.getElementById("orderModal")
            ).hide();

        } catch (error) {

            console.error(error);

            alert("❌ Failed to Reject Order");

        }

    });

}

// ======================================
// LIVE CLOCK
// ======================================

const liveStatus = document.getElementById("liveStatus");

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

    renderOrders();

}, 10000);

// ======================================
// PAGE LOAD
// ======================================

window.addEventListener("load", () => {

    loadRate();

    renderOrders();

});

console.log("✅ TS Dollar Exchange Admin Loaded Successfully");
