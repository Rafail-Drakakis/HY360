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
// Helper function to display the tables
async function table_render(table_name) {
    try {
        const response = await fetch(`${API_URL}/` + table_name, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        let jsonData = await response.json();

        // Get the container element where the table will be inserted
        let container = document.getElementById(table_name + "_container");
        // Clear prvious render
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        // Append the table title to the container element
        let head = document.createElement("h2");
        head.textContent = table_name.charAt(0).toUpperCase() +
            table_name.slice(1) + " Table";
        container.appendChild(head);
        // Create the table element
        let table = document.createElement("table");
        // Get the keys (column names) of the first object in the JSON data
        let cols = Object.keys(jsonData[0]);
        // Create the header element
        let thead = document.createElement("thead");
        let tr = document.createElement("tr");
        // Loop through the column names and create header cells
        cols.forEach((item) => {
            let th = document.createElement("th");
            th.innerText = item; // Set the column name as the text of the header cell
            tr.appendChild(th); // Append the header cell to the header row
        });
        thead.appendChild(tr); // Append the header row to the header
        table.append(tr); // Append the header to the table
        // Loop through the JSON data and create table rows
        jsonData.forEach((item) => {
            let tr = document.createElement("tr");

            // Get the values of the current object in the JSON data
            let vals = Object.values(item);
            // Loop through the values and create table cells
            vals.forEach((elem) => {
                let td = document.createElement("td");
                td.innerText = elem; // Set the value as the text of the table cell
                tr.appendChild(td); // Append the table cell to the table row
            });
            table.appendChild(tr); // Append the table row to the table
        });
        container.appendChild(table); // Append the table to the container element
    } catch (error) {
        showMessage("Internal error rendering table");
        console.log("Error", error.stack);
        console.log("Error", error.name);
        console.log("Error", error.message);
    }
}
// Helper function to populate tickets
async function add_ticket(
    t_eid,
    t_type,
    t_price,
    t_availability,
    t_seat_number,
) {
    var state = 0;
    var tid1 = null;
    while (true) {
        try {
            if (Number(state) == 0) {
                const ticket = {
                    type: t_type,
                    price: t_price,
                    availability: t_availability,
                    seat_number: t_seat_number,
                };
                const response = await fetch(`${API_URL}/tickets`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(ticket),
                });
                const result = await response.json();
                if (response.status === 201) {
                    state = 1;
                    tid = result.tid;
                } else {
                    console.log("first post failed");
                    throw response.status;
                }
            }
            if (Number(state) == 1) {
                const has = {
                    tid: tid1,
                    eid: t_eid,
                };
                const response = await fetch(`${API_URL}/has`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(has),
                });
                const result = await response.json();
                if (response.status === 201) {
                    return;
                } else {
                    console.log("second post failed");
                    throw response.status;
                }
            }
        } catch (error) {
            console.log("ERROR 3", error.stack);
            console.log("Error", error.message);
        }
    }
}
async function update_event_chooser(empty) {
    while (true) {
        try {
            const response = await fetch(`${API_URL}/eventnames`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            let jsonData = await response.json();
            console.log(Object.keys(jsonData).length);
            let container = document.getElementById("bookEventIdselect");
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            for (let i = 0; i < Object.keys(jsonData).length; i++) {
                var option = document.createElement("option");
                option.value = jsonData[i].eid;
                option.innerHTML = jsonData[i].name;
                container.appendChild(option);
            }
            return;
        } catch (error) {
            showMessage("error updating checkbox");
            console.log("Error", error.stack);
            console.log("Error", error.name);
            console.log("Error", error.message);
        }
    }
}
async function update_tickets_chooser() {
    console.log("was called"); 
    var vip_price = "";
    var front_price = "";
    var normal_price = "";
    var eid = document.getElementById("bookEventIdselect").value;
    var tries = 5;
    event_loop: while (tries > 0) {
        tries--;
        try {
            let response = await fetch(`${API_URL}/ticket_price/` + eid + "/" + "VIP", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            let result = await response.json();
            if (response.status != 200) {
                throw response.status;
            }
            vip_price = String(result.price) + "€";
            console.log("vip price was" + String(vip_price[0]));
            response = await fetch(`${API_URL}/ticket_price/` + eid + "/" + "FrontRow", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            result = await response.json();
            if (response.status != 200) {
                throw response.status;
            } 
            front_price = String(result.price) + "€";
            console.log("f price was" + front_price);
            response = await fetch(`${API_URL}/ticket_price/` + eid + "/" + "Normal", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            result = await response.json();
            if (response.status != 200) {
                throw response.status;
            }
            normal_price = String(result.price) + "€";
            console.log("normal price was" + normal_price);
            break event_loop;
        } catch (error) {
            showMessage("error updating checkbox");
            console.log("Error", error.stack);
            console.log("Error", error.name);
            console.log("Error", error.message);
        }
    }
    if (tries <= 0) {
        console.log("error");
        return;
    }
    let container = document.getElementById("bookTicketsFormdiv");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    var ticket_num = document.getElementById("numOfTickets").value;
    for (let i = 0; i < ticket_num; i++) {
        var label = document.createElement("label");
        label.innerText = "Type for ticket #" + (Number(i) + 1) + ":";
        var t_type = document.createElement("select");
        var type1 = document.createElement("option");
        type1.value = "VIP";
        type1.innerHTML = "VIP" + "(" + vip_price + ")";
        t_type.appendChild(type1);
        var type2 = document.createElement("option");
        type2.value = "FrontRow";
        type2.innerHTML = "Front Row" + "(" + front_price + ")";
        t_type.appendChild(type2);
        var type3 = document.createElement("option");
        type3.value = "Normal";
        type3.innerHTML = "Normal" + "(" + normal_price + ")";
        t_type.appendChild(type3);
        container.appendChild(label);
        container.appendChild(t_type);
    }
    return;
}
document.getElementById("bookEventIdselect").addEventListener(
    "change",
    async (e) => {
        e.preventDefault();
        console.log("hello");
        try {
            const response = await fetch(
                `${API_URL}/available_seats/` +
                    getElementById("bookEventIdselect").value,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                },
            );
            let jsonData = await response.json();
            console.log(Object.keys(jsonData).length);
            let container = document.getElementById("tickets_select");
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            for (let i = 0; i < Object.keys(jsonData).length; i++) {
                var option = document.createElement("option");
                option.value = jsonData[i].tid;
                option.innerHTML = jsonData[i].type + " " +
                    jsonData[i].seat_number + " " + jsonData[i].price +
                    "(euro)";
                container.appendChild(option);
            }
        } catch (error) {
            showMessage("error updating checkbox");
            console.log("Error", error.stack);
            console.log("Error", error.name);
            console.log("Error", error.message);
        }
    },
);
// Function to handle adding a new customer
document.getElementById("addCustomerForm").addEventListener(
    "submit",
    async (e) => {
        e.preventDefault();
        const customer = {
            mail: document.getElementById("customerEmail").value,
            credit_info: document.getElementById("customerCredit").value,
            f_name: document.getElementById("customerFirstName").value,
            l_name: document.getElementById("customerLastName").value,
        };
        try {
            const response = await fetch(`${API_URL}/customers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(customer),
            });
            const result = await response.json();
            if (response.status === 201) {
                showMessage(result.message, "success");
                table_render("customers");
            } else {
                showMessage(result.message, "error");
            }
        } catch (error) {
            showMessage("Error adding customer. Try again.", "error");
            console.log("Error", error.stack);
            console.log("Error", error.name);
            console.log("Error", error.message);
        }
    },
);
// Function to handle adding a new event
document.getElementById("addEventForm").addEventListener(
    "submit",
    async (e) => {
        e.preventDefault();
        const event1 = {
            name: document.getElementById("eventName").value,
            type: document.getElementById("eventType").value,
            time: document.getElementById("eventTime").value,
            date: document.getElementById("eventDate").value,
            capacity: document.getElementById("eventCapacity").value,
        };
        let capacity = document.getElementById("eventCapacity").value;
        let vip_num = document.getElementById("VIP_Capacity").value;
        let front_num = document.getElementById("FrontRow_Capacity").value;
        let normal_num = document.getElementById("Normal_Capacity").value;
        let vip_price = document.getElementById("VIP_Price").value;
        let front_price = document.getElementById("FrontRow_Price").value;
        let normal_price = document.getElementById("Normal_Price").value;
        if (
            !isFinite(vip_num) || !isFinite(front_num) || !isFinite(normal_num)
        ) {
            showMessage("Error: Number of seats given isn't integer!", "error");
            return;
        }
        if (
            (Number(vip_num) + Number(front_num) + Number(normal_num)) !=
                Number(capacity)
        ) {
            showMessage(
                "Error: Number of seats don't add up to capacity!",
                "error",
            );
            return;
        }
        try {
            const response = await fetch(`${API_URL}/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(event1),
            });
            const result = await response.json();
            let event_id = result.id;
            if (response.status === 201) {
                //event added to db
                for (let i = 0; i < Number(vip_num); i++) {
                    add_ticket(event_id, "VIP", vip_price, 1, i + 1);
                }
                for (let i = 0; i < Number(front_num); i++) {
                    add_ticket(
                        event_id,
                        "FrontRow",
                        front_price,
                        1,
                        i + 1 + Number(vip_num),
                    );
                }
                for (let i = 0; i < Number(normal_num); i++) {
                    add_ticket(
                        event_id,
                        "Normal",
                        normal_price,
                        1,
                        i + 1 + Number(vip_num) + Number(front_num),
                    );
                }
                showMessage(result.message, "success");
                table_render("events");
                setTimeout(table_render("tickets"), 500);
                update_event_chooser("aaa");
            } else {
                showMessage(result.message, "error");
            }
        } catch (error) {
            showMessage("Error adding event. Try again.", "error");
            console.log("Error", error.stack);
            console.log("Error", error.name);
            console.log("Error", error.message);
        }
    },
);
// Function to search for available seats
document.getElementById("searchSeatsForm").addEventListener(
    "submit",
    async (e) => {
        e.preventDefault();
        const eventId = document.getElementById("eventId").value;
        try {
            const response = await fetch(
                `${API_URL}/available_tickets/${eventId}`,
            );
            const seats = await response.json();
            if (seats.length > 0) {
                document.getElementById("availableSeatsResult").innerText = JSON
                    .stringify(seats, null, 2);
                showMessage(
                    `Found ${seats.length} available seats for event ID ${eventId}.`,
                    "success",
                );
            } else {
                showMessage("No available seats found for this event.", "info");
            }
        } catch (error) {
            showMessage("Error fetching available seats. Try again.", "error");
            console.log("Error", error.stack);
            console.log("Error", error.name);
            console.log("Error", error.message);
        }
    },
);
// Function to book tickets for an event
document.getElementById("bookTicketsForm").addEventListener(
    "submit",
    async (e) => {
        e.preventDefault();
        const booking = {
            eid: document.getElementById("bookEventId").value,
            cid: document.getElementById("customerId").value,
            date: new Date().toISOString().split("T")[0], // Current date
            total_price: 100, // Placeholder total price (calculation can be updated)
            tickets_number: document.getElementById("numTickets").value,
            tickets: Array.from({
                length: document.getElementById("numTickets").value,
            }, (_, i) => i + 1), // Dummy ticket IDs
        };
        try {
            const response = await fetch(`${API_URL}/reserve_tickets_temp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(booking),
            });
            const result = await response.json();
            if (response.status === 201) {
                showMessage(result.message, "success");
                table_render("tickets");
                table_render("reservations");
            } else {
                showMessage(result.message, "error");
            }
        } catch (error) {
            showMessage("Error booking tickets. Try again.", "error");
            console.log("Error", error.stack);
            console.log("Error", error.name);
            console.log("Error", error.message);
        }
    },
);
// Function to cancel a reservation
document.getElementById("cancelReservationForm").addEventListener(
    "submit",
    async (e) => {
        e.preventDefault();
        const reservationId = document.getElementById("reservationId").value;
        try {
            const response = await fetch(
                `${API_URL}/cancel_reservation/${reservationId}`,
                {
                    method: "DELETE",
                },
            );
            const result = await response.json();
            if (response.status === 200) {
                showMessage(result.message, "success");
                table_render("tickets");
                table_render("reservations");
            } else {
                showMessage(result.message, "error");
            }
        } catch (error) {
            showMessage("Error canceling reservation. Try again.", "error");
            console.log("Error", error.stack);
            console.log("Error", error.name);
            console.log("Error", error.message);
        }
    },
);
// Function to view tickets left for all events
document.getElementById("viewTicketsLeft").addEventListener(
    "click",
    async () => {
        try {
            const response = await fetch(`${API_URL}/events`);
            const events = await response.json();
            const ticketsLeft = await Promise.all(
                events.map(async (event) => {
                    const ticketResponse = await fetch(
                        `${API_URL}/available_tickets/${event.eid}`,
                    );
                    const tickets = await ticketResponse.json();
                    return {
                        eventName: event.name,
                        ticketsLeft: tickets.length,
                    };
                }),
            );
            document.getElementById("eventStatisticsResult").innerText = JSON
                .stringify(ticketsLeft, null, 2);
            showMessage(
                "Successfully retrieved tickets left for all events.",
                "success",
            );
        } catch (error) {
            showMessage("Error fetching tickets left. Try again.", "error");
            console.log("Error", error.stack);
            console.log("Error", error.name);
            console.log("Error", error.message);
        }
    },
);
// Function to view event profits
document.getElementById("viewProfits").addEventListener("click", async () => {
    try {
        const response = await fetch(`${API_URL}/events`);
        const events = await response.json();
        const profits = await Promise.all(
            events.map(async (event) => {
                const profitResponse = await fetch(
                    `${API_URL}/event_revenue/${event.eid}`,
                );
                const revenue = await profitResponse.json();
                return {
                    eventName: event.name,
                    revenue: revenue.total_revenue,
                };
            }),
        );
        document.getElementById("eventStatisticsResult").innerText = JSON
            .stringify(profits, null, 2);
        showMessage(
            "Successfully retrieved profits for all events.",
            "success",
        );
    } catch (error) {
        showMessage("Error fetching profits. Try again.", "error");
        console.log("Error", error.stack);
        console.log("Error", error.name);
        console.log("Error", error.message);
    }
});
// Function to view the most popular event
document.getElementById("mostPopularEvent").addEventListener(
    "click",
    async () => {
        try {
            const response = await fetch(`${API_URL}/most_popular_event`);
            const event = await response.json();
            if (event.name) {
                showMessage(
                    `Most popular event is ${event.name} with ${event.reservations_count} reservations.`,
                    "success",
                );
            } else {
                showMessage("No popular events found.", "info");
            }
        } catch (error) {
            showMessage(
                "Error fetching most popular event. Try again.",
                "error",
            );
            console.log("Error", error.stack);
            console.log("Error", error.name);
            console.log("Error", error.message);
        }
    },
);
// Function to view the highest profit event within a date range
document.getElementById("highestProfitEvent").addEventListener(
    "click",
    async () => {
        const startDate = prompt("Enter start date (YYYY-MM-DD):");
        const endDate = prompt("Enter end date (YYYY-MM-DD):");
        try {
            const response = await fetch(`${API_URL}/highest_revenue_event`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    start_date: startDate,
                    end_date: endDate,
                }),
            });
            const event = await response.json();
            if (event.name) {
                showMessage(
                    `Highest profit event is ${event.name} with revenue of ${event.revenue}.`,
                    "success",
                );
            } else {
                showMessage(
                    "No events found for the given time period.",
                    "info",
                );
            }
        } catch (error) {
            showMessage(
                "Error fetching highest profit event. Try again.",
                "error",
            );
            console.log("Error", error.stack);
            console.log("Error", error.name);
            console.log("Error", error.message);
        }
    },
);
