import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/test"; // Replace "test" with your database name
        String username = "root"; // Use "root" unless your MySQL uses a different username
        String password = ""; // If you set a MySQL password, use it here

        try {
            Connection connection = DriverManager.getConnection(url, username, password);
            System.out.println("Connected to the database successfully!");
            connection.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
