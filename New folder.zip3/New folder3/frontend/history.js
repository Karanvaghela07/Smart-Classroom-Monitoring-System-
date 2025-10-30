document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#attendance-table tbody");
    const dateFilter = document.getElementById("date-filter");
    const filterBtn = document.getElementById("filter-btn");
    const resetBtn = document.getElementById("reset-btn");

    let allRecords = [];

    // Load attendance from backend
    async function loadAttendance() {
        try {
            const res = await fetch("http://127.0.0.1:5000/get_attendance");
            const data = await res.json();

            if (data.status === "success") {
                allRecords = data.data;
                displayRecords(allRecords);
            } else {
                tableBody.innerHTML = `<tr><td colspan="4">${data.message}</td></tr>`;
            }
        } catch (err) {
            console.error("Error:", err);
            tableBody.innerHTML = `<tr><td colspan="4">⚠️ Failed to load records</td></tr>`;
        }
    }

    // Show records in table
    function displayRecords(records) {
        tableBody.innerHTML = "";

        if (records.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4">No attendance found</td></tr>`;
            return;
        }

        records.forEach(r => {
            const row = `
                <tr>
                    <td>${r["Student ID"]}</td>
                    <td>${r["Student Name"]}</td>
                    <td>${r["DateTime"]}</td>
                    <td>${r["Marked By"]}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    // Apply date filter
    filterBtn.addEventListener("click", () => {
        const selectedDate = dateFilter.value;
        if (!selectedDate) return alert("Please select a date");

        const filtered = allRecords.filter(r => r.DateTime.startsWith(selectedDate));
        displayRecords(filtered);
    });

    // Reset filter
    resetBtn.addEventListener("click", () => {
        dateFilter.value = "";
        displayRecords(allRecords);
    });

    // Load on startup
    loadAttendance();
});
