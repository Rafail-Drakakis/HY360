import sqlite3

# Create connection and cursor
conn = sqlite3.connect('EventManagement.db')
cursor = conn.cursor()

# Create tables
cursor.execute("""
CREATE TABLE Customer (
    cid INTEGER PRIMARY KEY,
    mail TEXT NOT NULL UNIQUE,
    credit_info TEXT,
    f_name TEXT,
    l_name TEXT
);
""")

cursor.execute("""
CREATE TABLE Event (
    eid INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    time TEXT,
    date TEXT,
    capacity INTEGER
);
""")

cursor.execute("""
CREATE TABLE Ticket (
    tid INTEGER PRIMARY KEY,
    type TEXT,
    price REAL,
    availability BOOLEAN DEFAULT 1,
    seat_number INTEGER
);
""")

cursor.execute("""
CREATE TABLE Reservation (
    rid INTEGER PRIMARY KEY,
    eid INTEGER,
    cid INTEGER,
    date TEXT,
    total_price REAL,
    tickets_number INTEGER,
    FOREIGN KEY (eid) REFERENCES Event(eid),
    FOREIGN KEY (cid) REFERENCES Customer(cid)
);
""")

cursor.execute("""
CREATE TABLE Contains (
    eid INTEGER,
    tid INTEGER,
    PRIMARY KEY (eid, tid),
    FOREIGN KEY (eid) REFERENCES Event(eid),
    FOREIGN KEY (tid) REFERENCES Ticket(tid)
);
""")

cursor.execute("""
CREATE TABLE Makes (
    cid INTEGER,
    rid INTEGER,
    PRIMARY KEY (cid, rid),
    FOREIGN KEY (cid) REFERENCES Customer(cid),
    FOREIGN KEY (rid) REFERENCES Reservation(rid)
);
""")

conn.commit()
conn.close()