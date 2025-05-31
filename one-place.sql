-- PostgreSQL SQL Dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Database: one-place
--

--
-- Table structure for table accounts
--

CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  password TEXT,
  role TEXT DEFAULT 'user',
  datecreated TIMESTAMP DEFAULT NOW()
);

--
-- Dumping data for table accounts
--
--
-- Table structure for table calendar
--

-- fix calendar sql table creation data
    CREATE TABLE calendar (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      title TEXT,
      details TEXT,
      deadlineDate TIMESTAMP DEFAULT NOW(),
      hours TIME DEFAULT CURRENT_TIME,
      addDate TIMESTAMP DEFAULT NOW,
      worker TEXT
    );

--
-- Table structure for table clients
--

CREATE TABLE clients (
  client_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id),
  client TEXT,
  clientDetails TEXT,
  phone TEXT,
  country TEXT,
  street TEXT,
  city TEXT,
  postalCode TEXT,
  clientDateCreated DATE DEFAULT CURRENT_DATE
);



CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, 
  client_id UUID NOT NULL,//
  date TIMESTAMP DEFAULT NOW(),
  price NUMERIC(10, 2),//
  status TEXT DEFAULT 'Pending', 
  workerName TEXT DEFAULT 'Mayor',
  FOREIGN KEY (client_id) REFERENCES clients(client_id)
);

--
-- Table structure for table products
--

CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  productName TEXT NOT NULL,
  amount INTEGER,
  itemPrice NUMERIC(10, 2),
  totalPrice  NUMERIC(10, 2),
);

CREATE TABLE prices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product TEXT NOT NULL,
  price NUMERIC(10, 2),
  former_price NUMERIC(10, 2),
  date TIMESTAMP DEFAULT NOW()
);

--
-- Adjust sequences for serial columns
--

ALTER SEQUENCE accounts_id_seq RESTART WITH 2;