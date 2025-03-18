import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import { initializer } from "./passport-config.js";
import passport from "passport";
import bcrypt from "bcryptjs";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import expressSession from "express-session";
import { createRequire } from "module";
import "dotenv/config";
const require = createRequire(import.meta.url);
const pgSession = require("connect-pg-simple")(expressSession);
import {
  getDashboardData,
  getAllOrders,
  getAllClientWithOrders,
  getProductPrice,
  addNewClient,
  addNewOrder,
  getAllOrderOfId,
  getAllClients,
  fetchExistingOrderOfId
} from "./queries.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

import {} from "./queries.js";

var client = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT,
});

// // CONFIGURING OPTIONS
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200,
};
const saltRounds = 10;

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  expressSession({
    store: new pgSession({
      pool: client,
      tableName: "sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
initializer(client, passport);

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ success: true, message: "Login successful" });
    });
  })(req, res, next);
});

app.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const checkUser = await client.query(
      "SELECT * FROM accounts WHERE email = $1",
      [email]
    );
    if (checkUser.rows.length > 0) {
      return res.json({ message: "User already exists" });
    }
    const result = await client.query(
      "INSERT INTO accounts (id ,username, password, email) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING RETURNING *",
      [id, username, hashedPassword, email]
    );
    const user = result.rows[0];
    req.login(user, (err) => {
      if (err) {
        console.log("Error Registering in", err);
        res.json({ message: "error" });
      } else {
        res.json({ message: "success" });
        return;
      }
    });
  } catch (error) {
    console.error("Error registering user", error);
  }
});


app.get("/orders", async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error("Failed to get orders", error);
  }
});

app.get("/clients", async (req, res) => {
  try {
    const result = await getAllClientWithOrders();
    res.json(result);
  } catch (error) {
    console.error("Failed to get clients", error);
  }
});

app.post("/getAllOrderOfId", async(req, res)=>{
  const {orderId} = req.body
  try {
    const repsonse = await getAllOrderOfId(orderId);
    res.json(repsonse);
  } catch (error) {
    console.error("Failded to get associating products", error);
  }
})

app.post("/fetchExistingOrderOfId", async (req, res)=>{
  const {orderId} = req.body;
  try {
    const response = await fetchExistingOrderOfId(orderId);
    res.json(response);
  } catch (error) {
    console.error("Error fetching existing order", error);
  }
})
/*Go continue later, stopping clients to continue order page*/
app.get("/getAllClients", async (req, res) => {
  try {
    const result = await getAllClients();
    res.json(result);
  } catch (error) {
    console.error("Failed to get clients", error);
  }
});

app.get("/dashboard_data", async (req, res) => {
  try {
    const result = await getDashboardData();
    res.json(result);
  } catch (error) {
    console.error("Error getting data", error);
  }
});

app.post("/new_order", async (req, res) => {
  const account_id = req.user.id;
  const item = await req.body;
  const { clientDetails, isNewClient, oldClientId } = req.body;
  if (isNewClient) {
    try {
      addNewClient(clientDetails, account_id);
    } catch (error) {
      console.error("Error setting up new client", error);
    }
  } else {
    try {
      const product = clientDetails.products;
      const status = clientDetails.status;
      addNewOrder(oldClientId, product, status);
    } catch (error) {
      console.error("Error creating order for existing client", error);
    }
  }
});

app.post("/get_price", async (req, res) => {
  const { productName } = req.body;
  try {
    const result = await getProductPrice(productName);
    res.json(result);
  } catch (error) {
    console.error("Error getting price", error);
  }
});

app.get("/logout", (req, res) => {
  req.logout();
  res.json({ message: "success" });
});

app.get("/user", (req, res) => {
  if (!req.isAuthenticated()) {
    return
  }
  return res.json(req.user);
});

const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
