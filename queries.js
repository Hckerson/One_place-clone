import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config";

const client = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT,
});

export async function getDashboardData() {
  const clientData = await client.query(
    "SELECT * FROM clients "
  );
  const orderData = await client.query(
    "SELECT * FROM orders as o  INNER JOIN clients as c ON o.client_id = c.client_id WHERE o.status = 'paid'"
  );
  const calendarData = await client.query(
    "SELECT * FROM calendar WHERE deadlinedate >= CURRENT_DATE AND deadlinedate < CURRENT_DATE + INTERVAL '6 days'  order by deadlinedate asc LIMIT 2"
  );
  const [clientDataResult, orderDataResult, calendarDataResult] =
    await Promise.all([clientData, orderData, calendarData]);
  return {
    client: clientDataResult.rows,
    order: orderDataResult.rows,
    calendar: calendarDataResult.rows,
  };
}

export async function getAllOrders() {
  try {
    const allOrders = await client.query(
      "SELECT c.account_id,  o.id, o.date, a.username, a.email, o.price, o.status, o.workerName FROM orders as o INNER JOIN clients as c ON o.client_id = c.client_id INNER JOIN accounts as a ON a.id = c.account_id ORDER BY o.date DESC  "
    );
    return allOrders.rows;
  } catch (error) {
    console.error("Failed to query order from database", error);
  }
}

export async function getProductPrice(product) {
  try {
    const productPrice = await client.query(
      "SELECT price FROM prices WHERE product LIKE  $1",
      [`%${product}%`]
    );
    return productPrice.rows
  } catch (error) {
    console.error("Failed to get product price", error);
    
  }
}

export async function getAllClientWithOrders(){
  try {
    const allClientsWithOrders = await client.query("SELECT c.client, c.clientdetails, c.phone, c.country, c.city,  c.street, c.postalcode, o.status, o.client_id  FROM orders as o INNER JOIN clients as c  ON o.client_id = c.client_id");
    return allClientsWithOrders.rows;
  } catch (error) {
    console.error("Failed to query clietn from database", error);
  }
}
