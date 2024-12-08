from flask import Flask, request, jsonify, render_template
import sqlite3
app = Flask(__name__)

def db_connection():
    conn = sqlite3.connect('EventManagement.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/customers', methods=['GET', 'POST'])
def manage_customers():
    conn = db_connection()
    cursor = conn.cursor()

    if request.method == 'GET':
        cursor.execute("SELECT * FROM Customer")
        customers = [dict(row) for row in cursor.fetchall()]
        return jsonify(customers)

    if request.method == 'POST':
        new_customer = request.json
        cursor.execute("""
        INSERT INTO Customer (mail, credit_info, f_name, l_name)
        VALUES (?, ?, ?, ?)
        """, (new_customer['mail'], new_customer['credit_info'], 
              new_customer['f_name'], new_customer['l_name']))
        conn.commit()
        return jsonify({'message': 'Customer added successfully!'}), 201

@app.route('/events', methods=['GET', 'POST'])
def manage_events():
    conn = db_connection()
    cursor = conn.cursor()

    if request.method == 'GET':
        cursor.execute("SELECT * FROM Event")
        events = [dict(row) for row in cursor.fetchall()]
        return jsonify(events)

    if request.method == 'POST':
        new_event = request.json
        cursor.execute("""
        INSERT INTO Event (name, type, time, date, capacity)
        VALUES (?, ?, ?, ?, ?)
        """, (new_event['name'], new_event['type'], 
              new_event['time'], new_event['date'], 
              new_event['capacity']))
        conn.commit()
        return jsonify({'message': 'Event added successfully!'}), 201

@app.route('/tickets', methods=['GET', 'POST'])
def manage_tickets():
    conn = db_connection()
    cursor = conn.cursor()

    if request.method == 'GET':
        cursor.execute("SELECT * FROM Ticket")
        tickets = [dict(row) for row in cursor.fetchall()]
        return jsonify(tickets)

    if request.method == 'POST':
        new_ticket = request.json
        cursor.execute("""
        INSERT INTO Ticket (type, price, availability, seat_number)
        VALUES (?, ?, ?, ?)
        """, (new_ticket['type'], new_ticket['price'], 
              new_ticket['availability'], new_ticket['seat_number']))
        conn.commit()
        return jsonify({'message': 'Ticket added successfully!'}), 201

@app.route('/reservations', methods=['GET', 'POST'])
def manage_reservations():
    conn = db_connection()
    cursor = conn.cursor()

    if request.method == 'GET':
        cursor.execute("SELECT * FROM Reservation")
        reservations = [dict(row) for row in cursor.fetchall()]
        return jsonify(reservations)

    if request.method == 'POST':
        new_reservation = request.json
        cursor.execute("""
        INSERT INTO Reservation (eid, cid, date, total_price, tickets_number)
        VALUES (?, ?, ?, ?, ?)
        """, (new_reservation['eid'], new_reservation['cid'], 
              new_reservation['date'], new_reservation['total_price'], 
              new_reservation['tickets_number']))
        conn.commit()
        return jsonify({'message': 'Reservation added successfully!'}), 201

@app.route('/contains', methods=['POST'])
def manage_contains():
    conn = db_connection()
    cursor = conn.cursor()

    new_contains = request.json
    cursor.execute("""
    INSERT INTO Contains (eid, tid)
    VALUES (?, ?)
    """, (new_contains['eid'], new_contains['tid']))
    conn.commit()
    return jsonify({'message': 'Relation added successfully!'}), 201

@app.route('/makes', methods=['POST'])
def manage_makes():
    conn = db_connection()
    cursor = conn.cursor()

    new_makes = request.json
    cursor.execute("""
    INSERT INTO Makes (cid, rid)
    VALUES (?, ?)
    """, (new_makes['cid'], new_makes['rid']))
    conn.commit()
    return jsonify({'message': 'Relation added successfully!'}), 201

@app.route('/available_tickets/<int:eid>', methods=['GET'])
def get_available_tickets(eid):
    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM Ticket 
    WHERE availability = 1 AND tid IN (SELECT tid FROM Contains WHERE eid = ?)
    """, (eid,))
    tickets = [dict(row) for row in cursor.fetchall()]
    return jsonify(tickets)

@app.route('/customer_reservations/<int:cid>', methods=['GET'])
def get_customer_reservations(cid):
    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM Reservation WHERE cid = ?
    """, (cid,))
    reservations = [dict(row) for row in cursor.fetchall()]
    return jsonify(reservations)

@app.route('/reservation_cost/<int:rid>', methods=['GET'])
def get_reservation_cost(rid):
    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT SUM(Ticket.price) AS total_cost
    FROM Ticket 
    JOIN Contains ON Ticket.tid = Contains.tid
    JOIN Reservation ON Contains.eid = Reservation.eid
    WHERE Reservation.rid = ?
    """, (rid,))
    cost = cursor.fetchone()
    return jsonify({'total_cost': cost['total_cost'] if cost else 0})

@app.route('/customers/<int:cid>', methods=['DELETE'])
def delete_customer(cid):
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Customer WHERE cid = ?", (cid,))
    conn.commit()
    return jsonify({'message': f'Customer with ID {cid} deleted successfully!'}), 200

@app.route('/events/<int:eid>', methods=['DELETE'])
def delete_event(eid):
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Event WHERE eid = ?", (eid,))
    conn.commit()
    return jsonify({'message': f'Event with ID {eid} deleted successfully!'}), 200

@app.route('/tickets/<int:tid>', methods=['DELETE'])
def delete_ticket(tid):
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Ticket WHERE tid = ?", (tid,))
    conn.commit()
    return jsonify({'message': f'Ticket with ID {tid} deleted successfully!'}), 200

@app.route('/reservations/<int:rid>', methods=['DELETE'])
def delete_reservation(rid):
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Reservation WHERE rid = ?", (rid,))
    conn.commit()
    return jsonify({'message': f'Reservation with ID {rid} deleted successfully!'}), 200

@app.route('/available_seats/<int:eid>/<string:seat_type>', methods=['GET'])
def get_available_seats(eid, seat_type):
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM Ticket 
    WHERE availability = 1 AND type = ? AND tid IN (SELECT tid FROM Contains WHERE eid = ?)
    """, (seat_type, eid))
    tickets = [dict(row) for row in cursor.fetchall()]
    return jsonify(tickets)

@app.route('/reserve_tickets', methods=['POST'])
def reserve_tickets():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.json
    cursor.execute("""
    INSERT INTO Reservation (eid, cid, date, total_price, tickets_number)
    VALUES (?, ?, ?, ?, ?)
    """, (data['eid'], data['cid'], data['date'], data['total_price'], data['tickets_number']))
    rid = cursor.lastrowid
    tickets = data['tickets']
    for tid in tickets:
        cursor.execute("""
        UPDATE Ticket SET availability = 0 WHERE tid = ?
        """, (tid,))
        cursor.execute("""
        INSERT INTO Contains (eid, tid) VALUES (?, ?)
        """, (data['eid'], tid))
    conn.commit()
    return jsonify({'message': 'Reservation completed successfully!', 'reservation_id': rid}), 201

@app.route('/cancel_reservation/<int:rid>', methods=['DELETE'])
def cancel_reservation(rid):
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT eid, tid FROM Contains 
    WHERE tid IN (SELECT tid FROM Ticket WHERE tid IN 
                  (SELECT tid FROM Contains WHERE eid IN (SELECT eid FROM Reservation WHERE rid = ?)))
    """, (rid,))
    tickets = cursor.fetchall()
    for ticket in tickets:
        cursor.execute("""
        UPDATE Ticket SET availability = 1 WHERE tid = ?
        """, (ticket['tid'],))
    cursor.execute("DELETE FROM Contains WHERE tid IN (SELECT tid FROM Ticket WHERE tid IN (SELECT tid FROM Contains WHERE eid IN (SELECT eid FROM Reservation WHERE rid = ?)))", (rid,))
    cursor.execute("DELETE FROM Reservation WHERE rid = ?", (rid,))
    conn.commit()
    return jsonify({'message': 'Reservation canceled successfully!'}), 200

@app.route('/cancel_event/<int:eid>', methods=['DELETE'])
def cancel_event(eid):
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT rid FROM Reservation WHERE eid = ?
    """, (eid,))
    reservations = cursor.fetchall()
    for reservation in reservations:
        cancel_reservation(reservation['rid'])
    cursor.execute("DELETE FROM Event WHERE eid = ?", (eid,))
    conn.commit()
    return jsonify({'message': f'Event with ID {eid} canceled and all reservations refunded.'}), 200

@app.route('/event_revenue/<int:eid>', methods=['GET'])
def event_revenue(eid):
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT SUM(total_price) AS total_revenue FROM Reservation WHERE eid = ?
    """, (eid,))
    revenue = cursor.fetchone()
    return jsonify({'total_revenue': revenue['total_revenue'] if revenue else 0})

@app.route('/most_popular_event', methods=['GET'])
def most_popular_event():
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT Event.name, COUNT(Reservation.rid) AS reservations_count 
    FROM Event 
    JOIN Reservation ON Event.eid = Reservation.eid 
    GROUP BY Event.eid 
    ORDER BY reservations_count DESC 
    LIMIT 1
    """)
    event = cursor.fetchone()
    return jsonify(event if event else {})

@app.route('/highest_revenue_event', methods=['POST'])
def highest_revenue_event():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.json
    cursor.execute("""
    SELECT Event.name, SUM(Reservation.total_price) AS revenue 
    FROM Event 
    JOIN Reservation ON Event.eid = Reservation.eid 
    WHERE Reservation.date BETWEEN ? AND ? 
    GROUP BY Event.eid 
    ORDER BY revenue DESC 
    LIMIT 1
    """, (data['start_date'], data['end_date']))
    event = cursor.fetchone()
    return jsonify(event if event else {})

@app.route('/revenue_by_ticket_type', methods=['GET'])
def revenue_by_ticket_type():
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT type, SUM(price) AS total_revenue 
    FROM Ticket 
    JOIN Contains ON Ticket.tid = Contains.tid 
    GROUP BY type
    """)
    revenue = cursor.fetchall()
    return jsonify(revenue)

if __name__ == '__main__':
    app.run(debug=True)