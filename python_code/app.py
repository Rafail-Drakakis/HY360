from flask import Flask, request, jsonify, render_template
import sqlite3
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def db_connection():
    conn = sqlite3.connect('EventManagement.db')
    conn.row_factory = sqlite3.Row
    return conn

'''
============================================
Functions to querry db,
Are called by js,
Js calls them by routing 
============================================

'''


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
        try:
            new_customer = request.json
            cursor.execute("""
            INSERT INTO Customer (mail, credit_info, f_name, l_name)
            VALUES (?, ?, ?, ?)
            """, (new_customer['mail'], new_customer['credit_info'], 
                new_customer['f_name'], new_customer['l_name']))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Customer added successfully!'}), 201
        except:
            conn.close()
            return jsonify({'message': 'Error, maybe email is not unique'}), 500

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
        try:
            cursor.execute("""
            INSERT INTO Event (name, type, time, date, capacity)
            VALUES (?, ?, ?, ?, ?)
            """, (new_event['name'], new_event['type'], 
                new_event['time'], new_event['date'], 
                new_event['capacity']))
            id = cursor.lastrowid
            conn.commit()
            conn.close()
            return jsonify({'message': 'Event added successfully!','id': id}), 201
        except:
            conn.close()
            return jsonify({'message': 'Error'}), 500


@app.route('/eventnames', methods=['GET'])
def dropdown_events():
    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT eid,name FROM Event")
    events = [dict(row) for row in cursor.fetchall()]
    return jsonify(events)


@app.route('/tickets', methods=['GET', 'POST'])
def manage_tickets():
    conn = db_connection()
    cursor = conn.cursor()

    if request.method == 'GET':
        cursor.execute("SELECT * FROM Ticket")
        tickets = [dict(row) for row in cursor.fetchall()]
        return jsonify(tickets)

    if request.method == 'POST':
        try:
            new_ticket = request.json
            cursor.execute("""
            INSERT INTO Ticket (type, price, availability, seat_number)
            VALUES (?, ?, ?, ?)
            """, (new_ticket['type'], new_ticket['price'], 
                new_ticket['availability'], new_ticket['seat_number']))
            id = cursor.lastrowid
            conn.commit()
            conn.close()
            return jsonify({'message': 'Ticket added successfully!', 'tid':id}), 201
        except:
            conn.close()
            return jsonify({'message': 'Error'}), 500


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
        try:
            cursor.execute("""
            INSERT INTO Reservation (eid, cid, date, total_price, tickets_number)
            VALUES (?, ?, ?, ?, ?)
            """, (new_reservation['eid'], new_reservation['cid'], 
                    new_reservation['date'], new_reservation['total_price'], 
                    new_reservation['tickets_number']))
            row = cursor.fetchone()
            (inserted_id, ) = row if row else None
            conn.commit()
            conn.close()
            return jsonify({'message': 'Reservation added successfully!'}), 201
        except:
            conn.close()
            return jsonify({'message': 'Error'}), 500


@app.route('/contains', methods=['GET', 'POST'])
def manage_contains():
    conn = db_connection()
    cursor = conn.cursor()
    if request.method == 'GET':
        cursor.execute("SELECT * FROM Contains")
        res = [dict(row) for row in cursor.fetchall()]
        return jsonify(res)

    if request.method == 'POST':
        new_contains = request.json
        try:
            cursor.execute("""
            INSERT INTO Contains (eid, tid)
            VALUES (?, ?)
            """, (new_contains['eid'], new_contains['tid']))
            conn.commit()
            return jsonify({'message': 'Relation added successfully!'}), 201
        except:
            conn.close()
            return jsonify({'message': 'Error'}), 500


@app.route('/makes', methods=['GET', 'POST'])
def manage_makes():
    conn = db_connection()
    cursor = conn.cursor()
    if request.method == 'GET':
            cursor.execute("SELECT * FROM Makes")
            res= [dict(row) for row in cursor.fetchall()]
            return jsonify(res)

    if request.method == 'POST':
        new_makes = request.json
        try:
            cursor.execute("""
            INSERT INTO Makes (cid, rid)
            VALUES (?, ?)
            """, (new_makes['cid'], new_makes['rid']))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Relation added successfully!'}), 201
        except:
            conn.close()
            return jsonify({'message': 'Error'}), 500


@app.route('/has', methods=['GET', 'POST'])
def manage_has():
    conn = db_connection()
    cursor = conn.cursor()
    if request.method == 'GET':
            cursor.execute("SELECT * FROM Has")
            res= [dict(row) for row in cursor.fetchall()]
            return jsonify(res)

    if request.method == 'POST':
        new_has = request.json
        try:
            cursor.execute("""
            INSERT INTO Has (tid, eid)
            VALUES (?, ?)
            """, (new_has['tid'], new_has['eid']))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Relation added successfully!'}), 201
        except:
            conn.close()
            return jsonify({'message': 'Error'}), 500



@app.route('/available_tickets/<int:eid>', methods=['GET'])
def get_available_tickets(eid):
    conn = db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
        SELECT * FROM Ticket 
        WHERE availability = 1 AND tid IN (SELECT tid FROM Contains WHERE eid = ?)
        """, (eid,))
        tickets = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(tickets)
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500


@app.route('/customer_reservations/<int:cid>', methods=['GET'])
def get_customer_reservations(cid):
    conn = db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
        SELECT * FROM Reservation WHERE cid = ?
        """, (cid,))
        reservations = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(reservations)
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500



@app.route('/reservation_cost/<int:rid>', methods=['GET'])
def get_reservation_cost(rid):
    conn = db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
        SELECT SUM(Ticket.price) AS total_cost
        FROM Ticket 
        JOIN Contains ON Ticket.tid = Contains.tid
        JOIN Reservation ON Contains.eid = Reservation.eid
        WHERE Reservation.rid = ?
        """, (rid,))
        cost = cursor.fetchone()
        conn.close()
        return jsonify({'total_cost': cost['total_cost'] if cost else 0})
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500



@app.route('/customers/<int:cid>', methods=['DELETE'])
def delete_customer(cid):
    conn = db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM Customer WHERE cid = ?", (cid,))
        conn.commit()
        conn.close()
        return jsonify({'message': f'Customer with ID {cid} deleted successfully!'}), 200
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500



@app.route('/events/<int:eid>', methods=['DELETE'])
def delete_event(eid):
    conn = db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM Event WHERE eid = ?", (eid,))
        conn.commit()
        conn.close()
        return jsonify({'message': f'Event with ID {eid} deleted successfully!'}), 200
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500



@app.route('/tickets/<int:tid>', methods=['GET'])
def delete_ticket(tid):
    conn = db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM Ticket WHERE tid = ?", (tid,))
        conn.commit()
        conn.close()
        return jsonify({'message': f'Ticket with ID {tid} deleted successfully!'}), 200
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500



@app.route('/reservations/<int:rid>', methods=['DELETE'])
def delete_reservation(rid):
    conn = db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Reservation WHERE rid = ?", (rid,))
        conn.commit()
        conn.close()
        return jsonify({'message': f'Reservation with ID {rid} deleted successfully!'}), 200
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500


@app.route('/available_seats/<int:eid>/<string:seat_type>', methods=['GET'])
def get_available_seats(eid, seat_type):
    conn = db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        SELECT * FROM Ticket 
        WHERE availability = 1 AND type = ? AND tid IN (SELECT tid FROM Contains WHERE eid = ?)
        """, (seat_type, eid))
        tickets = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(tickets)
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500


@app.route('/ticket_price/<int:eid>/<string:seat_type>', methods=['GET'])
def get_price_of_ticket(eid, seat_type):
    conn = db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        SELECT price FROM Ticket 
        WHERE type = ? AND tid IN (SELECT tid FROM Has WHERE eid = ?)
        LIMIT 1
        """, (seat_type, eid))
        price = cursor.fetchone()[0]
        print(price)
        conn.close()
        return jsonify( { "price": price }), 200
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500




@app.route('/available_seats/<int:eid>', methods=['GET'])
def get_available_seats_all(eid):
    conn = db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        SELECT seat_number, type FROM Ticket 
        WHERE availability = 1 AND tid IN (SELECT tid FROM Has WHERE eid = ?)
        """, (eid,))
        seats = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(seats)
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500


def check_we_have_enough(data):
    conn = db_connection()
    cursor = conn.cursor()
    tids = []
    wanted_count = list(data["tickets"].values())
    try:
        for seat_type in enumerate((list(data["tickets"].keys()))):
            cursor.execute("""
            SELECT tid FROM Ticket 
            WHERE availability = 1 AND type= ? AND tid IN (SELECT tid FROM Has WHERE eid = ?)
            LIMIT %s
            """ %wanted_count[seat_type[0]],(seat_type[1],data["eid"]))
            tmp_tids = [row[0] for row in cursor.fetchall()]
            tids.extend(tmp_tids)
    except:
        conn.close()
        return  500,jsonify({'message': 'Error fetching tids'}), 1 

    if (len(tids) < sum(wanted_count)):
        return  500, jsonify({'message': 'Error: Not enough available seats'}), 1
    return  0, 0, tids

def get_cid_from_email(mail):
    conn = db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        SELECT cid FROM Customer 
        WHERE mail is ?
        """, (mail,))
        cid = cursor.fetchone()[0]
        return 0, 0, cid
    except:
        conn.close()
        return 500, jsonify({'message': 'Error finding customer from email'}), 1



@app.route('/reserve_tickets', methods=['POST'])
def reserve_tickets():
    data = request.json
    price_arr = []
    for s_type in list(data["tickets"].keys()):
        jdata, status = get_price_of_ticket(data['eid'], s_type)
        if(status != 500):
            price_arr.append(jdata.get_json()['price'])
        else:
            return jsonify({'message': 'Error'}), 500
    
    print(list(data["tickets"].values()))
    print(price_arr)
    data['total_price'] = sum([a * b for a, b in zip(list(data["tickets"].values()), price_arr)])

    s, msg, data["tickets"] = check_we_have_enough(data)
    if s == 500:
        return msg, s
    s, msg, data["cid"]= get_cid_from_email(data["cid"])
    if s == 500:
        return msg, s

    conn = db_connection()
    cursor = conn.cursor()

    try:
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
        
        cursor.execute("""
        INSERT INTO Makes(cid, rid)
        VALUES (?, ?)
        """, (data['cid'],rid))

        conn.commit()
        conn.close()
        return jsonify({'message': 'Reservation completed successfully!', 'reservation_id': rid}), 201
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500


@app.route('/cancel_reservation/<int:rid>', methods=['GET'])
def cancel_reservation(rid):
    conn = db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        SELECT tid FROM Contains 
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
        conn.close()
        return jsonify({'message': 'Reservation canceled successfully!'}), 200
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500


@app.route('/cancel_event/<int:eid>', methods=['DELETE'])
def cancel_event(eid):
    conn = db_connection()
    cursor = conn.cursor()
    data = request.json
    eid = data['eid']
    print("hello" + eid)
    try:
        cursor.execute("""
        DELETE FROM Contains 
        WHERE rid IN 
        (SELECT FROM  Reservation WHERE eid = ?")""",(eid,))
        conn.commit()
        cursor.execute("""
        DELETE FROM Has
        WHERE rid IN 
        (SELECT FROM  Reservation WHERE eid = ?")""",(eid,))
        conn.commit()
        cursor.execute("""
        DELETE FROM Ticket
        WHERE tid IN 
        (SELECT FROM Has WHERE eid = ?")""",(eid,))
        cursor.execute("DELETE FROM HAS WHERE eid = ? ", (eid,))
        conn.commit()
        cursor.execute("DELETE FROM Event WHERE eid = ?", (eid,))
        conn.commit()
        cursor.execute("DELETE FROM Reservation WHERE eid = ?", (eid,))
        conn.commit()
        conn.close()
        return jsonify({'message': f'Event with ID {eid} canceled and all reservations refunded.'}), 200
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500


@app.route('/revenue_event', methods=['POST'])
def event_revenue():
    data = request.json
    print(data)
    if(data['type'] == "VIP"):
        return jsonify({'message': 'Not implemented yet'}), 500
    else:
        conn = db_connection()
        cursor = conn.cursor()
        if(data['eid'] != "All"):
            try:
                cursor.execute("""
                SELECT SUM(total_price) FROM Reservation WHERE eid = ?
                """, (int(data["eid"]),))
                revenue = cursor.fetchone()[0]
                conn.close()
                return jsonify({'total_revenue': revenue if revenue else 0})
            except:
                conn.close()
                return jsonify({'message': 'Error'}), 500
        else: 
            try:
                print("hello from try")
                cursor.execute("""
                SELECT SUM(total_price) FROM Reservation
                """)
                revenue = cursor.fetchone()[0]
                conn.close()
                return jsonify({'total_revenue': revenue if revenue else 0})
            except:
                conn.close()
                return jsonify({'message': 'Error2'}), 500
    return jsonify({'message': 'Error3'}), 500
    


@app.route('/most_popular_event', methods=['GET'])
def most_popular_event():
    conn = db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        SELECT Event.name, COUNT(Reservation.rid) AS reservations_count 
        FROM Event 
        JOIN Reservation ON Event.eid = Reservation.eid 
        GROUP BY Event.eid 
        ORDER BY reservations_count DESC 
        LIMIT 1
        """)
        pos = cursor.fetchone()
        event = pos[0]
        count = pos[1]
        conn.close()
        return jsonify({"name": event, 'reservations_count': count})
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500


@app.route('/highest_revenue_event', methods=['POST'])
def highest_revenue_event():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.json
    try:
        cursor.execute("""
        SELECT Event.name, SUM(Reservation.total_price) AS revenue 
        FROM Event 
        JOIN Reservation ON Event.eid = Reservation.eid 
        WHERE Reservation.date BETWEEN ? AND ? 
        GROUP BY Event.eid 
        ORDER BY revenue DESC 
        LIMIT 1
        """, (data['start_date'], data['end_date']))
        pos = cursor.fetchone()
        event = pos[0]
        revenue = pos[1]
        conn.close()
        return jsonify({"name": event, "revenue":revenue})
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500


@app.route('/active_reserve', methods=['POST'])
def active_reservations():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.json
    try:
        cursor.execute("""
        SELECT cid, eid, date, tickets_number, total_price
        FROM Reservation 
        WHERE Reservation.date BETWEEN ? AND ? 
        """, (data['start_date'], data['end_date']))
        active = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(active), 200
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500




@app.route('/revenue_by_ticket_type', methods=['GET'])
def revenue_by_ticket_type():
    conn = db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        SELECT type, SUM(price) AS total_revenue 
        FROM Ticket 
        JOIN Contains ON Ticket.tid = Contains.tid 
        GROUP BY type
        """)
        revenue = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(revenue)
    except:
        conn.close()
        return jsonify({'message': 'Error'}), 500


if __name__ == '__main__':
    app.run(debug=True)



