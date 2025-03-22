import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Styles/order.css";
import { AuthLoginInfo } from "./../AuthComponents/AuthLogin";
import Popup from "../Components/Popup";
import clsx from "clsx";
import { useDebouncedCallback } from "use-debounce";
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
  const [isNewClient, setIsNewClient] = useState(true);
  const [likelyProduct, setLikelyProduct] = useState([]);
  const [dropdown, setDropdown] = useState(false);
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

  // useEffect(()=>{
  //   console.log('Filtered', filteredData);
  // }, [filteredData])
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
    fetchClientData();
  }, []);

  useEffect(() => {}, [ordersData, displaySearch]);

  const decideStatus = (orders) => {
    if (orders.length < 1) {
      setFilteredData(ordersData);
    } else {
      const filtered = ordersData.filter((order) => order.status === orders);
      setFilteredData(filtered);
    }
  };

  const removeProduct = (identifier) => {
    console.log(identifier);

    // Use filter to create a new array without the item to remove
    const updatedProductList = clientDetails.products.filter(
      (_, index) => index !== identifier
    );

    setClientDetails({
      ...clientDetails,
      products: updatedProductList,
    });
    const removeProduct = (identifier) => {
      console.log(identifier);

      // Use filter to create a new array without the item to remove
      const updatedProductList = clientDetails.products.filter(
        (_, index) => index !== identifier
      );

      setClientDetails({
        ...clientDetails,
        products: updatedProductList,
      });
    };
  };

  const addNewOrder = async () => {
    const response = await axios.post(
      "http://localhost:5000/new_order",
      { clientDetails, isNewClient, oldClientId },
      { withCredentials: true }
    );
  };

  const handleSearchChange = (newFilteredData) => {
    setFilteredData(newFilteredData);
  };

  const fetchPrice = useDebouncedCallback(async (product) => {
    const response = await axios.post(
      "http://localhost:5000/get_price",
      { productName: product },
      { withCredentials: true }
    );
    if (product.lenth < 1) {
      setLikelyProduct([]);
    } else {
      setLikelyProduct([...(response?.data?.likelyProduct ?? [])]);
    }
    const amount = response?.data?.price;
    const result = Number(amount) || 0;
    setProductDetails({
      ...productDetails,
      itemPrice: result,
    });
  }, 2000);

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
    postalCode,
    city,
    status
  ) => {
    setOldClientId(id);
    setClientDetails({
      ...clientDetails,
      clientName: client,
      clientDetails: details,
      phone: phone,
      country: country,
      street: street,
      postalCode: postalCode,
      city: city,
      status: status,
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
                      <td>${order.price}</td>
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
        <div className="popupWrap h-[80vh]  ">
          <div className="productSummary">
            <h3 className="productSummaryLeft">Add new order</h3>
            <div className="absolute top-4 right-10 newUserSwitch">
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
                <label className="switchLabel " htmlFor="yes">
                  Yes
                </label>
                <label className="switchLabel" htmlFor="no">
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
                  <ul className="bg-red-500 relative p-1 ">
                    {allClientsData
                      ?.filter((client) =>
                        [
                          client.client_id,
                          client.client,
                          client.clientdetails,
                          client.phone,
                          client.country,
                          client.street,
                          client.postalcode,
                          client.city,
                          client.status,
                        ].some((r) =>
                          r.toLowerCase().includes(stringSearch.toLowerCase())
                        )
                      )
                      .map((val, i) => {
                        return (
                          <li
                            onClick={() =>
                              setSearchingInput(
                                val.client_id,
                                val.client,
                                val.clientdetails,
                                val.phone,
                                val.country,
                                val.street,
                                val.postalcode,
                                val.city,
                                val.status
                              )
                            }
                            className="autoCompleteOption"
                            key={i}
                          >
                            <span>
                              {val.client_id.substring(0, 8) + "..."}{" "}
                            </span>
                            <span>{val.client}</span>
                          </li>
                        );
                      })}
                  </ul>
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
                    value={clientDetails.status}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        status: e.target.value,
                      })
                    }
                    required="required"
                  >
                    <option value="" disabled>
                      Select Status
                    </option>
                    <option value={"paid"}>Paid</option>
                    <option value={"pending"}>Pending</option>
                    <option value={"shipped"}>Shipped</option>
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
                        <td className="relative">
                          <input
                            type="text"
                            className="productDetailsInput"
                            value={productDetails.productName}
                            onChange={(e) => {
                              setProductDetails({
                                ...productDetails,
                                productName: e.target.value,
                              });
                              if (e.target.value.length > 0) {
                                setDropdown(true);
                                fetchPrice(e.target.value);
                              } else {
                                setDropdown(false);
                              }
                            }}
                            required="required"
                          />
                          <ul className="flex flex-col space-y-9 translate-y-1 w-full">
                            {dropdown &&
                              likelyProduct?.map((name, index) => {
                                return (
                                  <li
                                    key={index}
                                    onClick={() => {
                                      setProductDetails({
                                        ...productDetails,
                                        productName: name.product,
                                      });
                                      fetchPrice(name.product);
                                      setDropdown(false);
                                    }}
                                    className="absolute top-full w-full cursor-pointer  bg-stone-200 p-1  rounded-lg"
                                  >
                                    {name.product}
                                  </li>
                                );
                              })}
                          </ul>
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
                            className="productDetailsInput"
                            value={productDetails.itemPrice}
                            onChange={() => {
                              setProductDetails({
                                ...productDetails,
                                itemPrice: Number(productDetails.itemPrice),
                              });
                            }}
                          />
                        </td>
                        <td>
                          {productDetails.itemPrice * productDetails.amount}
                        </td>
                      </tr>
                      {clientDetails.products.map((product, index) => {
                        return (
                          <tr key={index}>
                            <td>{product.productName}</td>
                            <td>{product.amount}</td>
                            <td>{product.itemPrice}</td>
                            <td>{product.amount * product.itemPrice}</td>
                            <td
                              className="removeProduct"
                              onClick={() => removeProduct(index)}
                            >
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
                    setProductDetails({
                      productName: "",
                      amount: 1,
                      itemPrice: 0,
                      totalPrice: 0,
                    });
                  }}
                >
                  + Add next product
                </span>
              </div>
              <div className="productSummaryRight">
                <span className="totalCost">
                  Total price of products - $
                  {clientDetails.products.reduce(
                    (total, item) => total + item.itemPrice * item.amount,
                    0
                  )}
                </span>
              </div>
            </div>
            <div className="submitNewOrder">
              <button
                className={clsx("w-full box-border rounded-xl p-2", {
                  "bg-[#ef5f63]": clientDetails.products.length > 0,
                  "bg-red-400/25": clientDetails.products.length < 1,
                })}
                disabled={clientDetails.products.length < 1}
                onClick={() => {
                  addNewOrder();
                  setClientDetails({
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
                  setProductDetails({
                    productName: "",
                    amount: 1,
                    itemPrice: 0,
                    totalPrice: 0,
                  });
                }}
              >
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
