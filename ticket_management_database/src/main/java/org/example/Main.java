package org.example;

import java.sql.*;

public class Main {

    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost";
        String databaseName = "test";
        String username = "root";
        String password = "";

        int port = 3306;

        boolean is_already_created = false;

        try {
            Connection connection = DriverManager.getConnection(
                    url + ":" + port + "/" + databaseName + "?characterEncoding=UTF-8", username, password);

            create_tables(connection);

            connection.close();
        } catch (SQLException e) {
            System.exit(1);
        }
    }

    private static void create_tables(Connection con) throws SQLException {
        Statement statement = con.createStatement();

        // creating the basic tables

        statement.executeUpdate(
                "CREATE TABLE Customer (" +
                " cid INT PRIMARY KEY," +
                " mail VARCHAR(255) NOT NULL," +
                " credit_info VARCHAR(255)," +
                " f_name VARCHAR(100)," +
                " l_name VARCHAR(100)" +
                ")"
        );

        statement.executeUpdate(
                "CREATE TABLE Event (" +
                " eid INT PRIMARY KEY," +
                " name VARCHAR(255) NOT NULL," +
                " type VARCHAR(100)," +
                " time TIME," +
                " date DATE," +
                " capacity INT" +
                ")"
        );

        statement.executeUpdate(
                "CREATE TABLE Ticket (" +
                " tid INT PRIMARY KEY," +
                " type VARCHAR(100)," +
                " price DECIMAL(10, 2)," +
                " availability BOOLEAN DEFAULT TRUE," +
                " seat_number INT" +
                ")"
        );

        statement.executeUpdate(
                "CREATE TABLE Reservation (" +
                " rid INT PRIMARY KEY," +
                " eid INT," +
                " cid INT," +
                " date DATE," +
                " total_price DECIMAL(10, 2)," +
                " tickets_number INT," +
                " FOREIGN KEY (eid) REFERENCES Event(eid)," +
                " FOREIGN KEY (cid) REFERENCES Customer(cid)" +
                ")"
        );

        // relations between fundamental tables

        statement.executeUpdate(
                " CREATE TABLE Contains (" +
                " eid INT," +
                " tid INT," +
                " PRIMARY KEY (eid, tid)," +
                " FOREIGN KEY (eid) REFERENCES Event(eid)," +
                " FOREIGN KEY (tid) REFERENCES Ticket(tid)" +
                ")"
        );

        statement.executeUpdate(
                " CREATE TABLE Makes (" +
                " cid INT," +
                " rid INT," +
                " PRIMARY KEY (cid, rid)," +
                " FOREIGN KEY (cid) REFERENCES Customer(cid)," +
                " FOREIGN KEY (rid) REFERENCES Reservation(rid)" +
                ")"
        );

        statement.executeUpdate(
                " CREATE TABLE Has (" +
                " tid INT," +
                " eid INT," +
                " PRIMARY KEY (tid, eid)," +
                " FOREIGN KEY (tid) REFERENCES Ticket(tid)," +
                " FOREIGN KEY (eid) REFERENCES Event(eid)" +
                ")"
        );

    }
}