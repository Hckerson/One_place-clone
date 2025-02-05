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
  const clientData = await client.query("SELECT * FROM clients");
  const orderData = await client.query("SELECT * FROM orders");
  const calendarData = await client.query(
    "SELECT * FROM calendar WHERE deadlinedate >= CURRENT_DATE AND deadlinedate - CURRENT_DATE <= 5 order by deadlinedate asc LIMIT 2"
  );
  const [clientDataResult, orderDataResult, calendarDataResult] =
    await Promise.all([clientData, orderData, calendarData]);
  return { clientDataResult, orderDataResult, calendarDataResult };

}
