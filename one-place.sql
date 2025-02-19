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

INSERT INTO accounts (id, username, password, role, dateCreated) VALUES
(1, 'admin', '$2b$10$J1JTnk4KtLylMznNjWlRsOKPvsDEYDX.xyP77EY/Gq1JpccSnr3qa', 'admin', '2022-10-25');

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

a51966dc-8f87-4d9a-ae08-a164d8a6266c
  
--
-- Table structure for table orders
--
INSERT INTO orders (client_id, date, price, status, workername)
VALUES 
    ('c95bcac7-1cfe-4df9-be6a-5109e4208ece', '2025-01-27 14:30:00', 500000, 'Completed', 'Drex'),
    ('781487a5-cfb6-46e6-8f72-3ccded3544e9', '2025-02-01 18:30:00', 200000, 'Pending', 'Mayor');



CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, 
  client_id UUID NOT NULL,
  date TIMESTAMP DEFAULT NOW(),
  price NUMERIC(10, 2),
  status TEXT DEFAULT ' ',
  workerName TEXT,
  FOREIGN KEY (client_id) REFERENCES clients(client_id)
);

--
-- Table structure for table products
--

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  order_id INTEGER,
  productName TEXT,
  amount INTEGER,
  itemPrice REAL,
  totalPrice REAL
);

--
-- Adjust sequences for serial columns
--

ALTER SEQUENCE accounts_id_seq RESTART WITH 2;