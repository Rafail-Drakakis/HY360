const API_URL = "http://localhost:5000";

// Helper function to display notifications
function showMessage(message, type = "info") {
    const messageDiv = document.createElement("div");
    messageDiv.className = `notification ${type}`;
    messageDiv.textContent = message;

    // Add the message to the body
    document.body.appendChild(messageDiv);

    // Remove the message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Function to handle adding a new customer
document.getElementById("addCustomerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const customer = {
        mail: document.getElementById("customerEmail").value,
        credit_info: document.getElementById("customerCredit").value,
        f_name: document.getElementById("customerFirstName").value,
        l_name: document.getElementById("customerLastName").value
    };

    try {
        const response = await fetch(`${API_URL}/customers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customer)
        });
        const result = await response.json();
        if (response.status === 201) {
            showMessage(result.message, "success");
        } else {
            showMessage(result.message, "error");
        }
    } catch (error) {
        showMessage("Error adding customer. Try again.", "error");
    }
});

// Function to handle adding a new event
document.getElementById("addEventForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const event = {
        name: document.getElementById("eventName").value,
        type: document.getElementById("eventType").value,
        time: document.getElementById("eventTime").value,
        date: document.getElementById("eventDate").value,
        capacity: document.getElementById("eventCapacity").value
    };

    try {
        const response = await fetch(`${API_URL}/events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event)
        });
        const result = await response.json();
        if (response.status === 201) {
            showMessage(result.message, "success");
        } else {
            showMessage(result.message, "error");
        }
    } catch (error) {
        showMessage("Error adding event. Try again.", "error");
    }
});

// Function to search for available seats
document.getElementById("searchSeatsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const eventId = document.getElementById("eventId").value;

    try {
        const response = await fetch(`${API_URL}/available_tickets/${eventId}`);
        const seats = await response.json();
        if (seats.length > 0) {
            document.getElementById("availableSeatsResult").innerText = JSON.stringify(seats, null, 2);
            showMessage(`Found ${seats.length} available seats for event ID ${eventId}.`, "success");
        } else {
            showMessage("No available seats found for this event.", "info");
        }
    } catch (error) {
        showMessage("Error fetching available seats. Try again.", "error");
    }
});

// Function to book tickets for an event
document.getElementById("bookTicketsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const booking = {
        eid: document.getElementById("bookEventId").value,
        cid: document.getElementById("customerId").value,
        date: new Date().toISOString().split('T')[0], // Current date
        total_price: 100, // Placeholder total price (calculation can be updated)
        tickets_number: document.getElementById("numTickets").value,
        tickets: Array.from({ length: document.getElementById("numTickets").value }, (_, i) => i + 1) // Dummy ticket IDs
    };

    try {
        const response = await fetch(`${API_URL}/reserve_tickets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(booking)
        });
        const result = await response.json();
        if (response.status === 201) {
            showMessage(result.message, "success");
        } else {
            showMessage(result.message, "error");
        }
    } catch (error) {
        showMessage("Error booking tickets. Try again.", "error");
    }
});

// Function to cancel a reservation
document.getElementById("cancelReservationForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const reservationId = document.getElementById("reservationId").value;

    try {
        const response = await fetch(`${API_URL}/cancel_reservation/${reservationId}`, {
            method: "DELETE"
        });
        const result = await response.json();
        if (response.status === 200) {
            showMessage(result.message, "success");
        } else {
            showMessage(result.message, "error");
        }
    } catch (error) {
        showMessage("Error canceling reservation. Try again.", "error");
    }
});

// Function to view tickets left for all events
document.getElementById("viewTicketsLeft").addEventListener("click", async () => {
    try {
        const response = await fetch(`${API_URL}/events`);
        const events = await response.json();
        const ticketsLeft = await Promise.all(
            events.map(async (event) => {
                const ticketResponse = await fetch(`${API_URL}/available_tickets/${event.eid}`);
                const tickets = await ticketResponse.json();
                return { eventName: event.name, ticketsLeft: tickets.length };
            })
        );
        document.getElementById("eventStatisticsResult").innerText = JSON.stringify(ticketsLeft, null, 2);
        showMessage("Successfully retrieved tickets left for all events.", "success");
    } catch (error) {
        showMessage("Error fetching tickets left. Try again.", "error");
    }
});

// Function to view event profits
document.getElementById("viewProfits").addEventListener("click", async () => {
    try {
        const response = await fetch(`${API_URL}/events`);
        const events = await response.json();
        const profits = await Promise.all(
            events.map(async (event) => {
                const profitResponse = await fetch(`${API_URL}/event_revenue/${event.eid}`);
                const revenue = await profitResponse.json();
                return { eventName: event.name, revenue: revenue.total_revenue };
            })
        );
        document.getElementById("eventStatisticsResult").innerText = JSON.stringify(profits, null, 2);
        showMessage("Successfully retrieved profits for all events.", "success");
    } catch (error) {
        showMessage("Error fetching profits. Try again.", "error");
    }
});

// Function to view the most popular event
document.getElementById("mostPopularEvent").addEventListener("click", async () => {
    try {
        const response = await fetch(`${API_URL}/most_popular_event`);
        const event = await response.json();
        if (event.name) {
            showMessage(`Most popular event is ${event.name} with ${event.reservations_count} reservations.`, "success");
        } else {
            showMessage("No popular events found.", "info");
        }
    } catch (error) {
        showMessage("Error fetching most popular event. Try again.", "error");
    }
});

// Function to view the highest profit event within a date range
document.getElementById("highestProfitEvent").addEventListener("click", async () => {
    const startDate = prompt("Enter start date (YYYY-MM-DD):");
    const endDate = prompt("Enter end date (YYYY-MM-DD):");
    try {
        const response = await fetch(`${API_URL}/highest_revenue_event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start_date: startDate, end_date: endDate })
        });
        const event = await response.json();
        if (event.name) {
            showMessage(`Highest profit event is ${event.name} with revenue of ${event.revenue}.`, "success");
        } else {
            showMessage("No events found for the given time period.", "info");
        }
    } catch (error) {
        showMessage("Error fetching highest profit event. Try again.", "error");
    }
});
