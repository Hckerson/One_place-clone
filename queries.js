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

export async function getDashboardData(id) {
  const clientData = await client.query("SELECT * FROM clients WHERE account_id = $1", [id]);
  const orderData = await client.query("SELECT * FROM orders as o INNER JOIN clients as c ON o.client_id = c.client_id WHERE  c.account_id = $1", [id]);
  const calendarData = await client.query(
    "SELECT * FROM calendar WHERE deadlinedate >= CURRENT_DATE AND deadlinedate <= CURRENT_DATE + INTERVAL '5 days'  order by deadlinedate asc LIMIT 2"
  );
  const [clientDataResult, orderDataResult, calendarDataResult] =
  await Promise.all([clientData, orderData, calendarData]);
  return { client : clientDataResult.rows, order : orderDataResult.rows, calendar : calendarDataResult.rows };

}
