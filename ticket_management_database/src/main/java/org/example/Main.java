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

    }
}