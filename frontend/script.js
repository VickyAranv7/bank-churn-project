document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------
    // GLOBAL CHART
    // ---------------------------
    let chartInstance = null;

    function updateChart(score) {
        let low = Math.max(100 - score, 0);
        let mid = Math.max(score * 0.6, 0);
        let high = Math.max(score * 0.4, 0);

        let total = low + mid + high;

        low = Math.round((low / total) * 100);
        mid = Math.round((mid / total) * 100);
        high = Math.round((high / total) * 100);

        const canvas = document.getElementById("churnChart");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["Low Risk", "Medium Risk", "High Risk"],
                datasets: [{
                    data: [low, mid, high],
                    backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom" },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ctx.label + ": " + ctx.raw + "%"
                        }
                    }
                },
                animation: false
            }
        });
    }

    // ---------------------------
    // NAVIGATION
    // ---------------------------
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const target = item.getAttribute('data-target');

            navItems.forEach(i => i.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            item.classList.add('active');
            document.getElementById(target).classList.add('active');

            if (target === "customers") {
                populateCustomers();
            }

            if (target === "analytics") {
            setTimeout(drawAnalyticsChart, 100);
            }
        });
    });

    // ---------------------------
    // DARK MODE
    // ---------------------------
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    themeBtn.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';

        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeIcon.textContent = "🌙";
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeIcon.textContent = "☀️";
        }
    });

    // ---------------------------
    // FORM + PREDICTION
    // ---------------------------
    const form = document.getElementById('churn-form');
    const resultContent = document.getElementById('result-content');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const data = {
                name: document.getElementById('customerName').value,
                creditScore: Number(document.getElementById('creditScore').value),
                age: Number(document.getElementById('age').value),
                tenure: Number(document.getElementById('tenure').value),
                numProducts: Number(document.getElementById('numProducts').value),
                balance: Number(document.getElementById('balance').value),
                salary: Number(document.getElementById('salary').value),
                gender: document.getElementById('gender').value,
                geography: document.getElementById('geography').value
            };

            // ---------------------------
            // RULE-BASED PREDICTION
            // ---------------------------
            let score = 0;

            if (data.creditScore < 500) score += 30;
            else if (data.creditScore < 650) score += 15;

            if (data.age > 50) score += 10;

            if (data.tenure < 2) score += 25;
            else if (data.tenure < 5) score += 10;

            if (data.balance === 0) score += 20;

            if (data.numProducts === 1) score += 15;
            if (data.numProducts >= 3) score -= 10;

            if (data.geography === "Germany") score += 20;

            if (data.gender === "Female") score += 5;

            score = Math.min(Math.max(score, 0), 100);

            let level = "Low Risk";
            let color = "#10b981";

            if (score >= 70) {
                level = "High Risk ❌";
                color = "#ef4444";
            } else if (score >= 40) {
                level = "Medium Risk ⚠️";
                color = "#f59e0b";
            }

            // ---------------------------
            // SAVE HISTORY
            // ---------------------------
            let history = JSON.parse(localStorage.getItem("history") || "[]");

            history.unshift({
                name: data.name,
                tenure: data.tenure,
                score: score,
                level: level,
                color: color
            });

            localStorage.setItem("history", JSON.stringify(history));

            // ---------------------------
            // RESULT UI
            // ---------------------------
            resultContent.innerHTML = `
                <div class="result-display">
                    <div class="risk-badge" style="background:${color}20;color:${color};border:1px solid ${color}">
                        ${level}
                    </div>

                    <h3>${data.name}</h3>

                    <div class="prob-container">
                        <div class="prob-header">
                            <span>Churn Probability</span>
                            <span>${score}%</span>
                        </div>
                        <div class="prob-bar-bg">
                            <div class="prob-bar-fill" style="width:${score}%;background:${color}"></div>
                        </div>
                    </div>
                </div>
            `;

            // ✅ UPDATE CHART
            updateChart(score);
        });
    }

    // ---------------------------
    // CUSTOMERS TABLE
    // ---------------------------
    function populateCustomers() {
        const tableBody = document.querySelector("#customers-table tbody");
        const history = JSON.parse(localStorage.getItem("history") || "[]");

        tableBody.innerHTML = "";

        history.forEach(item => {
            const row = `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.tenure}</td>
                    <td>${item.score}%</td>
                    <td style="color:${item.color}">${item.level}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    // ---------------------------
    // INITIAL CHART
    // ---------------------------
    updateChart(30);

    let analyticsChartInstance = null;

function drawAnalyticsChart() {

    const canvas = document.getElementById("analyticsChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 🔥 destroy previous chart (VERY IMPORTANT)
    if (analyticsChartInstance) {
        analyticsChartInstance.destroy();
    }

    const dataValues = [50, 30, 20];

    analyticsChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Low Risk", "Medium Risk", "High Risk"],
            datasets: [{
                data: dataValues,
                backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "60%",

            animation: false,   

            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}


const clearBtn = document.getElementById("clear-data-btn");

if (clearBtn) {
    clearBtn.addEventListener("click", () => {

        if (!confirm("Are you sure you want to clear all saved predictions?")) return;

        localStorage.removeItem("history");   
        location.reload();                    

    });
}

});