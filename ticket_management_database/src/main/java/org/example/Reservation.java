package org.example;

public class Reservation {
    boolean is_successful = false;

    // create reservation in java code
    Reservation (int customer_id, Event event, int ticket_count, int total_price) {
        if (ticket_count > 0 || total_price > 0) {
            System.out.println("Invalid ticket count or price");
            System.exit(1);
        }

        if (event.get_capacity() >= ticket_count) {
            System.out.println("Not enough capacity");
            System.exit(1);
        }

        // perform sql INSERT

        if (this.is_successful) {
            // update ticket availability

        }

    }

}
