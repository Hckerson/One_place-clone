import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Styles/order.css";
import { AuthLoginInfo } from "./../AuthComponents/AuthLogin";
import Popup from "../Components/Popup";
import clsx from "clsx";
import SearchBar from "../Components/SearchBar";
import Pagination from "../Components/Pagination";
import ReadMoreRoundedIcon from "@mui/icons-material/ReadMoreRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";

function Orders() {
  const [newOrderSubmitted, setNewOrderSubmitted] = useState(false);
  const [ordersData, setOrdersData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [buttonPopup, setButtonPopup] = useState(false);
  const [filterOrders, setFilterOrders] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterActive, setFilterActive] = useState(1);
  const [isNewClient, setIsNewClient] = useState(false);
  const [displaySearch, setDisplaySearch] = useState(false);
  const [oldClientId, setOldClientId] = useState(null);
  const [stringSearch, setStringSearch] = useState("");
  const [allClientsData, setAllClientsData] = useState([]);
  const ctx = useContext(AuthLoginInfo);

  const [clientDetails, setClientDetails] = useState({
    clientName: "",
    clientDetails: "",
    phone: "",
    country: "",
    street: "",
    city: "",
    postalCode: "",
    status: "",
    products: [],
    workerName: ctx.username,
  });
  const [productDetails, setProductDetails] = useState({
    productName: "",
    amount: 1,
    itemPrice: 0,
    totalPrice: 0,
  });

  useEffect(() => {
    setNewOrderSubmitted(false);
    const fetchOrders = async () => {
      const response = await axios.get("http://localhost:5000/orders", {
        withCredentials: true,
      });
      const result = response.data;
      setOrdersData(result);
      setFilteredData(result);
      try {
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchOrders();
  }, [newOrderSubmitted]);

  useEffect(() => {
    const fetchClientData = async () => {
      const response = await axios.get("http://localhost:5000/clients", {
        withCredentials: true,
      });
      const result = response.data;
      setAllClientsData(result);
    };
  });

  useEffect(() => {
    // console.log("Fetched", ordersData);
    console.log("display", displaySearch);
  }, [ordersData, displaySearch]);

  const decideStatus = (orders) => {
    if (orders.length < 1) {
      setFilteredData(ordersData);
    } else {
      const filtered = ordersData.filter((order) => order.status === orders);
      setFilteredData(filtered);
    }
  };
  const handleSearchChange = (newFilteredData) => {
    setFilteredData(newFilteredData);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const totalOrders = filteredData.length;
  const computedOrders = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage
  );

  const setSearchingInput = (
    id,
    client,
    details,
    phone,
    country,
    street,
    city,
    postalCode
  ) => {
    setOldClientId(id);
    setClientDetails({
      ...clientDetails,
      clientName: client,
      clientDetails: details,
      phone: phone,
      country: country,
      street: street,
      city: city,
      postalCode: postalCode,
    });
    setDisplaySearch(false);
    setStringSearch("");
  };

  return (
    <div className="bodyWrap">
      <div className="contentOrderWrap">
        <div className="leftSide">
          <h1>Orders</h1>
          <Pagination
            total={totalOrders}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
          <div className="orderNavWrap">
            <ul className="flex space-x-4 py-2">
              <button
                className={clsx(
                  "border-b-4 ",
                  filterOrders === "" && "border-b-4 border-red-500"
                )}
                onClick={() => {
                  setFilterOrders("");
                  decideStatus("");
                }}
              >
                All orders
              </button>
              <button
                className={clsx(
                  "border-b-4 ",
                  filterOrders === "paid" && "border-b-4 border-red-500"
                )}
                onClick={() => {
                  setFilterOrders("paid");
                  decideStatus("paid");
                }}
              >
                Paid
              </button>
              <button
                className={clsx(
                  "border-b-4 ",
                  filterOrders === "pending" && "border-b-4 border-red-500"
                )}
                onClick={() => {
                  setFilterOrders("pending");
                  decideStatus("pending");
                }}
              >
                Pending
              </button>
              <button
                className={clsx(
                  "border-b-4 ",
                  filterOrders === "shipped" && "border-b-4 border-red-500"
                )}
                onClick={() => {
                  setFilterOrders("shipped");
                  decideStatus("shipped");
                }}
              >
                Shipped
              </button>
            </ul>
            <div className="addOrderWrap">
              <SearchBar
                data={ordersData}
                filters={filterOrders}
                handleSearchChange={handleSearchChange}
                dataType="orders"
              />
              <button
                className="addOrder"
                onClick={() => {
                  setButtonPopup(true);
                  setIsNewClient(true);
                }}
              >
                <AddCircleOutlineRoundedIcon />
                <span className="addOrderText">Add</span>
              </button>
            </div>
          </div>
          <div className="orderWrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Client name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {computedOrders?.map((order) => {
                  return (
                    <tr key={order.id}>
                      <td>
                        <font className="maincolor">#</font>
                        {order.id}
                      </td>
                      <td>{order.username}</td>
                      <td>{order.date.split("T")[0]}</td>
                      <td>{order.status}</td>
                      <td>
                        {order.price}
                        zł
                      </td>
                      <td className="maincolor">
                        <Link to={`/orders/${order.id}`}>
                          <ReadMoreRoundedIcon />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
        <div className="popupWrap h-[80vh]  -translate-y-20">
          <div className="productSummary">
            <h3 className="productSummaryLeft">Add new order</h3>
            <div className="productSummaryRight newUserSwitch">
              <h3>New client?</h3>
              <input
                type="radio"
                name="rdo"
                id="yes"
                onChange={() => setIsNewClient(true)}
                defaultChecked="defaultChecked"
              />
              <input
                type="radio"
                name="rdo"
                id="no"
                onChange={() => setIsNewClient(false)}
              />
              <div className="switch">
                <label
                  className="switchLabel "
                  htmlFor="yes"
                >
                  Yes
                </label>
                <label
                  className="switchLabel"
                  htmlFor="no"
                >
                  No
                </label>
                <span></span>
              </div>
            </div>
          </div>
          <div className="addNewOrderWrap">
            {!isNewClient && (
              <div className="autoCompleteWrap">
                <input
                  id="autoCompleteInput"
                  placeholder="Search client..."
                  type="text"
                  autoComplete="off"
                  value={stringSearch}
                  onChange={(e) => {
                    setStringSearch(e.target.value);
                    if (e.target.value.length > 0) {
                      setDisplaySearch(true);
                    } else {
                      setDisplaySearch(false);
                    }
                  }}
                />{" "}
                {displaySearch && (
                  <div className="autoCompleteContainer">
                    {allClientsData
                      ?.filter((client) => {
                        [
                          client.name,
                          client.clientdetails,
                          client.city,
                          client.country,
                          client.city,
                          client.postalCode,
                        ].some((val) =>
                          val.toLowerCase().includes(stringSearch.toLowerCase())
                        );
                      })
                      .map((val, i) => {
                        return (
                          <div
                            onClick={() =>
                              setSearchingInput(
                                val.client_id,
                                val.client,
                                val.clientdetails,
                                val.phone,
                                val.country,
                                val.street,
                                val.city,
                                val.postalCode
                              )
                            }
                            className="autoCompleteOption"
                            key={i}
                          >
                            <span>{val.client_id}</span>
                            <span>{val.client}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            <div className="addNewOrderForm">
              <div className="orderDetails">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Client name"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={clientDetails.clientName}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        clientName: e.target.value,
                      })
                    }
                    disabled={!isNewClient}
                    required="required"
                  />
                  <input
                    type="text"
                    placeholder="Phone number"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={clientDetails.phone}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        phone: e.target.value,
                      })
                    }
                    disabled={!isNewClient}
                    required="required"
                  />
                </div>
                <div className="input-group">
                  <input
                    type="textarea"
                    placeholder="Order details"
                    className="orderDetailsInput"
                    value={clientDetails.clientDetails}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        clientDetails: e.target.value,
                      })
                    }
                    disabled={!isNewClient}
                    required="required"
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Country"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={clientDetails.country}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        country: e.target.value,
                      })
                    }
                    disabled={!isNewClient}
                    required="required"
                  />
                  <input
                    type="text"
                    placeholder="Street, house number"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={clientDetails.street}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        street: e.target.value,
                      })
                    }
                    disabled={!isNewClient}
                    required="required"
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="City"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={clientDetails.city}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        city: e.target.value,
                      })
                    }
                    disabled={!isNewClient}
                    required="required"
                  />
                  <input
                    type="text"
                    placeholder="Postal code"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={clientDetails.postalCode}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        postalCode: e.target.value,
                      })
                    }
                    disabled={!isNewClient}
                    required="required"
                  />
                </div>
                <div className="input-group">
                  <select
                    className="orderDetailsSelect"
                    placeholder="Status"
                    value={clientDetails.status}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        status: e.target.value,
                      })
                    }
                    required="required"
                  >
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Shipped</option>
                  </select>
                </div>
              </div>

              <div className="productDetails">
                <div className="newOrderTable">
                  <table>
                    <thead>
                      <tr>
                        <th>Product name</th>
                        <th>Amount</th>
                        <th>Price</th>
                        <th>Total price</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <input
                            type="text"
                            placeholder="Product name"
                            className="productDetailsInput"
                            value={productDetails.productName}
                            onChange={(e) =>
                              setProductDetails({
                                ...productDetails,
                                productName: e.target.value,
                              })
                            }
                            required="required"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="1"
                            className="productDetailsInput"
                            value={productDetails.amount}
                            onChange={(e) =>
                              setProductDetails({
                                ...productDetails,
                                amount: Number(e.target.value),
                              })
                            }
                            required="required"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="10.00"
                            className="productDetailsInput"
                            value={productDetails.itemPrice}
                            onChange={(e) =>
                              setProductDetails({
                                ...productDetails,
                                itemPrice: Number(e.target.value),
                              })
                            }
                            required="required"
                          />
                        </td>
                        <td>
                          {productDetails.itemPrice * productDetails.amount}
                        </td>
                        <td></td>
                      </tr>
                      {clientDetails.products.map((product, key) => {
                        return (
                          <tr key={key}>
                            <td>{product.productName}</td>
                            <td>{product.amount}</td>
                            <td>{product.itemPrice}</td>
                            <td>{product.amount * product.itemPrice}</td>
                            <td className="removeProduct">
                              <RemoveRoundedIcon />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="submitWrap">
            <div className="productSummary">
              <div className="productSummaryLeft">
                <span
                  className="addNewLine"
                  onClick={() => {
                    setClientDetails({
                      ...clientDetails,
                      products: [...clientDetails.products, productDetails],
                    });
                  }}
                >
                  + Add next product
                </span>
              </div>
              <div className="productSummaryRight">
                <span className="totalCost">
                  Total price of products -{" "}
                  {clientDetails.products.reduce(
                    (a, b) => a + (b.itemPrice * b.amount || 0),
                    0
                  )}
                  zł
                </span>
              </div>
            </div>
            <div className="submitNewOrder">
              <button className="submitNewOrderBtn">
                <AddCircleOutlineRoundedIcon />
                <span className="addOrderText">Add</span>
              </button>
            </div>
          </div>
        </div>
      </Popup>
    </div>
  );
}

export default Orders;
