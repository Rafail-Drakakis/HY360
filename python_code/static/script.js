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
    while(container.firstChild){
        container.removeChild(container.firstChild);
    }
    
    // Append the table title to the container element
    let head = document.createElement("h2");
    head.textContent = table_name.charAt(0).toUpperCase() + table_name.slice(1) + " Table";
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
    table.append(tr) // Append the header to the table
    
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
    container.appendChild(table) // Append the table to the container element
    
    } 

    catch (error) {
        showMessage("Internal error rendering table");
        console.log("Error", error.stack);
        console.log("Error", error.name);
        console.log("Error", error.message);
    }

}


async function update_event_chooser(empty) {
    
    try {
        const response = await fetch(`${API_URL}/eventnames`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
     
    let jsonData = await response.json();
    
    console.log(Object.keys(jsonData).length);
    let container = document.getElementById("bookEventIdselect");
    
    while(container.firstChild){
        container.removeChild(container.firstChild);
    }
    
    for (let i = 0; i < Object.keys(jsonData).length; i++) {
        var option = document.createElement("option");
        option.value = jsonData[i].eid;
        option.innerHTML = jsonData[i].name;
        container.appendChild(option);    
    }
    }

    catch (error) {
        showMessage("error updating checkbox");
        console.log("Error", error.stack);
        console.log("Error", error.name);
        console.log("Error", error.message);
    }

}


// Helper function to populate tickets
async function add_ticket(t_eid,t_type,t_price,t_availability,t_seat_number) {
    const ticket = {
        type: t_type,
        price: t_price,
        availability: t_availability,
        seat_number:  t_seat_number   
    };

    try {
        const response = await fetch(`${API_URL}/tickets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ticket)
        });
        const result = await response.json();
        if (response.status === 201) {
            
            const has = {
                tid: result.tid,
                eid: t_eid,
            };

            const response = await fetch(`${API_URL}/has`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(has)
            });
            const result = await response.json();
            if (response.status === 201) {
                return;
            }
            else{
                console.log("ERROR 1");
                //TODO throw error?
            }
        }
        else{
            console.log("ERROR 2");
        }
    } catch (error) {
        // console.log("ERROR 3", error.stack);
        // console.log("Error", error.message);
        //TODO CLEAN ALL TICKETS, AND HAS TABLES WERE ENTREIS ARE relaetd to EID AND CANCEL EVENT
    }


}

document.getElementById("bookEventIdselect").addEventListener("change", async (e) => {
    e.preventDefault();
    console.log("hello")
    try {
        const response = await fetch(`${API_URL}/available_seats/` + getElementById("bookEventIdselect").value, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        });
     
        let jsonData = await response.json();
        
        console.log(Object.keys(jsonData).length);
        let container = document.getElementById("tickets_select");
        
        while(container.firstChild){
            container.removeChild(container.firstChild);
        }
        
        for (let i = 0; i < Object.keys(jsonData).length; i++) {
            var option = document.createElement("option");
            option.value = jsonData[i].tid;
            option.innerHTML = jsonData[i].type + " " + jsonData[i].seat_number + " " + jsonData[i].price + "(euro)";
            container.appendChild(option);    
        }
    }

    catch (error) {
        showMessage("error updating checkbox");
        console.log("Error", error.stack);
        console.log("Error", error.name);
        console.log("Error", error.message);
    }

});



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
});



// Function to handle adding a new event
document.getElementById("addEventForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const event1 = {
        name: document.getElementById("eventName").value,
        type: document.getElementById("eventType").value,
        time: document.getElementById("eventTime").value,
        date: document.getElementById("eventDate").value,
        capacity: document.getElementById("eventCapacity").value
    };

    let capacity = document.getElementById("eventCapacity").value;

    let vip_num = document.getElementById("VIP_Capacity").value;
    let front_num = document.getElementById("FrontRow_Capacity").value;
    let normal_num = document.getElementById("Normal_Capacity").value;
    
    let vip_price= document.getElementById("VIP_Price").value;
    let front_price= document.getElementById("FrontRow_Price").value;
    let normal_price = document.getElementById("Normal_Price").value;
    
    if(!isFinite(vip_num) || !isFinite(front_num) || !isFinite(normal_num)){
        showMessage("Error: Number of seats given isn't integer!", "error");
        return;
    }

    if ( (Number(vip_num) + Number(front_num) + Number(normal_num)) != Number(capacity)){
        showMessage("Error: Number of seats don't add up to capacity!", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event1)
        });
        const result = await response.json();
        
        let event_id = result.id;
        
        if (response.status === 201) {
            //event added to db
            for (let i = 0; i < Number(vip_num); i++) {
                add_ticket(event_id,"VIP",vip_price,1,(i+1));
            }
            for (let i = 0; i < Number(front_num); i++) {
                add_ticket(event_id,"FrontRow",front_price,1,(i+ 1 + Number(vip_num)));
            }

            for (let i = 0; i < Number(normal_num); i++) {
                add_ticket(event_id,"Normal",normal_price,1,(i+ 1 + Number(vip_num) + Number(front_num)));
            }

            showMessage(result.message, "success");
            table_render("events");
            table_render("tickets");
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
        console.log("Error", error.stack);
        console.log("Error", error.name);
        console.log("Error", error.message);
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
        console.log("Error", error.stack);
        console.log("Error", error.name);
        console.log("Error", error.message);
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
        console.log("Error", error.stack);
        console.log("Error", error.name);
        console.log("Error", error.message);
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
        console.log("Error", error.stack);
        console.log("Error", error.name);
        console.log("Error", error.message);
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
        console.log("Error", error.stack);
        console.log("Error", error.name);
        console.log("Error", error.message);
    }
});
