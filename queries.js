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
  const clientData = await client.query("SELECT * FROM clients ");
  const orderData = await client.query(
    "SELECT * FROM orders as o  INNER JOIN clients as c ON o.client_id = c.client_id WHERE o.status IN ('paid', 'shipped')"
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

export async function fetchExistingOrderOfId(order_id) {
  try {
    const result = await fetchClientDataRelatingToOrder(order_id);
    const response = await client.query(
      "SELECT  o.price, o.status, o.workername, p.productname, p.id,  p.amount, p.itemprice, p.totalprice FROM orders as o INNER JOIN products as p ON o.id = p.order_id WHERE o.id = $1",
      [order_id]
    );
    return {
      client: result,
      order: response.rows,
    };
  } catch (error) {
    console.error("Error fetching exiting order of id", error);
  }
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

export async function addNewClient(
  details,
  account_id = null,
  client_id = null
) {
  const {
    clientName,
    clientDetails,
    phone,
    country,
    street,
    city,
    products,
    postalCode,
    status,
  } = details;
  let result;
  if (account_id == null && client_id) {
    result = await client.query(
      "UPDATE clients SET client = $1, clientDetails = $2, phone = $3, country = $4, street = $5, city = $6, postalCode = $7 WHERE client_id = $8 RETURNING  client_id",
      [
        clientName,
        clientDetails,
        phone,
        country,
        street,
        city,
        postalCode,
        client_id,
      ]
    );
  } else if (client_id == null && account_id) {
    result = await client.query(
      "INSERT INTO clients(account_id, client, clientDetails, phone, country, street, city, postalCode) VALUES($1, $2, $3, $4, $5, $6, $7, $8 ) RETURNING  client_id",
      [
        account_id,
        clientName,
        clientDetails,
        phone,
        country,
        street,
        city,
        postalCode,
      ]
    );
    const id = result.rows[0].client_id;
    addNewOrder(id, products, status);
  }
}

export async function fetchClientDataRelatingToOrder(order_id) {
  try {
    const response = await client.query(
      "SELECT * FROM clients WHERE client_id = (SELECT client_id FROM orders WHERE id = $1)",
      [order_id]
    );
    return response.rows;
  } catch (error) {
    console.error("Error fetching client of id", error);
  }
}

export async function addNewOrder(client_id, product, status) {
  try {
    const totalPrice = product.reduce(
      (total, item) => total + item.amount * item.itemPrice,
      0
    );
    const result = await client.query(
      "INSERT INTO orders (client_id, price, status) VALUES($1, $2, $3) RETURNING id",
      [client_id, totalPrice, status]
    );
    const id = result.rows[0].id;
    await Promise.all(
      product.map(async (item) => {
        const itemTotalCost = item.amount * item.itemPrice;
        await addMultipleProducts(
          id,
          item.productName,
          item.amount,
          item.itemPrice,
          itemTotalCost
        );
      })
    );
  } catch (error) {
    console.error("Error adding new order", error);
  }
}

export async function updateExistingOrder(
  clientDetails,
  orderId,
  clientid,
  deletedItems
) {
  console.log(
    "clientDetails",
    clientDetails,
    "orderId",
    orderId,
    "clientid",
    clientid,
    "deletedItems",
    deletedItems
  );
  const product = clientDetails.products;
  const status = clientDetails.status;
  try {
    addNewClient(clientDetails, undefined, clientid);
    const totalPrice = product.reduce(
      (total, item) => total + item.amount * item.itemPrice,
      0
    );
    await client.query(
      "UPDATE orders SET price = $1, status = $2 WHERE id = $3 RETURNING *",
      [totalPrice, status, orderId]
    );
    for (let i = 0; i < deletedItems.ids.length; i++) {
      if (
        deletedItems.ids[i] == null ||
        deletedItems.ids[i] == undefined ||
        deletedItems.ids[i].length == ""
      ) {
        continue;
      }
      try {
        await client.query("DELETE FROM products WHERE id = $1", [
          deletedItems.ids[i],
        ]);
      } catch (error) {
        console.error("Error adding new order", error);
      }
    }
    const ids = [];
    const response = await client.query(
      "SELECT * FROM products WHERE order_id = $1",
      [orderId]
    );
    for (let i = 0; i < response.rows.length; i++) {
      ids.push(response.rows[i].id);
    }
    for (let i = 0; i < product.length; i++) {
      if (ids.includes(product[i].id)) {
        await client.query(
          "UPDATE products SET productname = $1, amount = $2, itemprice = $3, totalprice = $4 WHERE id = $5",
          [
            product[i].productName,
            product[i].amount,
            product[i].itemPrice,
            product[i].totalPrice,
            product[i].id,
          ]
        );
      } else {
        await client.query(
          "INSERT INTO products (order_id, productname, amount, itemprice, totalprice) VALUES ($1, $2, $3, $4, $5)",
          [
            orderId,
            product[i].productName,
            product[i].amount,
            product[i].itemPrice,
            (product[i].amount * product[i].itemPrice).toFixed(2),
          ]
        );
      }
    }
  } catch (error) {
    console.error("Error updating existing client details", error);
  }
}

export async function addMultipleProducts(id, name, amount, price, totalCost) {
  try {
    await client.query(
      "INSERT INTO products (order_id, productName, amount, itemPrice, totalPrice) VALUES ($1, $2, $3, $4, $5)",
      [id, name, amount, price, totalCost]
    );
  } catch (error) {
    console.error("Error adding product", error);
  }
}

export async function getProductPrice(product) {
  try {
    if (product.length > 0) {
      const productPrice = await client.query(
        "SELECT price FROM prices WHERE product LIKE  $1",
        [`%${product}%`]
      );
      const likelyProduct = await client.query(
        "SELECT product FROM prices WHERE product LIKE  $1",
        [`%${product}%`]
      );
      return {
        price: productPrice.rows[0].price,
        likelyProduct: likelyProduct.rows,
      };
    }
  } catch (error) {
    console.error("Failed to get product price", error);
  }
}

export async function getAllClientWithOrders() {
  try {
    const allClientsWithOrders = await client.query(
      "SELECT c.client, c.clientdetails, c.phone, c.country, c.city,  c.street, c.postalcode, o.status, o.client_id  FROM orders as o INNER JOIN clients as c  ON o.client_id = c.client_id"
    );
    return allClientsWithOrders.rows;
  } catch (error) {
    console.error("Failed to query clietn from database", error);
  }
}

export async function getAllClients() {
  try {
    const response = await client.query("SELECT * FROM clients");
    return response.rows;
  } catch (error) {
    console.error("Failed to get clients", error);
  }
}
