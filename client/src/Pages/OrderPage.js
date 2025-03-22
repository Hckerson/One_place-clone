import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import clsx from "clsx";
import { useDebouncedCallback } from "use-debounce";
import "./Styles/orderPage.css";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import Popup from "../Components/Popup";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

function OrderPage() {
  const { orderId } = useParams();
  const [buttonPopup, setButtonPopup] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [likelyProduct, setLikelyProduct] = useState([]);
  const [orderUpdated, setOrderUpdated] = useState(false);
  const [deletedItems, setDeletedItems] = useState({ ids: [] });
  const [supplementary, setSupplementary] = useState({
    id : "",
    total : 0,
    date : ""
  });
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
    workerName: "",
  });
  const [productDetails, setProductDetails] = useState({
    productName: "",
    amount: 1,
    itemPrice: 0,
    totalPrice: 0,
    id : "",
  });

  useEffect(() => {
    const fetchExistingOrderOfId = async () => {
      const response = await axios.post(
        "http://localhost:5000/fetchExistingOrderOfId",
        { orderId },
        { withCredentials: true }
      );
      const result = response.data;
      setSupplementary((prev) => {
        return{
          ...prev,
          id : result.client[0].client_id,
          total : result.order[0].price,
          date : result.client[0].clientdatecreated
        }
      })
      setClientDetails((prev) => {
        return {
          ...prev,
          clientName: result.client[0].client,
          clientDetails: result.client[0].clientdetails,
          phone: result.client[0].phone,
          country: result.client[0].country,
          street: result.client[0].street,
          city: result.client[0].city,
          postalCode: result.client[0].postalcode,
          status: result.order[0].status,
          workerName: result.order[0].workername,
        };
      });
      for (let i = 0; i < result.order.length; i++) {
        setClientDetails((prev) => {
          return {
            ...prev,
            products: [
              ...prev.products,
              {
                productName: result.order[i].productname,
                amount: result.order[i].amount,
                itemPrice: result.order[i].itemprice,
                totalPrice: result.order[i].totalprice,
                id: result.order[i].id,
              },
            ],
          };
        });
      }
    };
    fetchExistingOrderOfId();
  }, []);

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

  const updateOrder = async () => {
    const client_id = supplementary.id
    await axios.post(
      "http://localhost:5000/update_order",
      { clientDetails, orderId, client_id, deletedItems  },
      { withCredentials: true }
    );
    setOrderUpdated(true);
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
  };

  useEffect(() => {
    console.log(deletedItems );
  }, [deletedItems]);

  const OrderPageHeaderSection = () => {
    return (
      <div className="orderPageHeader">
        <h1>
          Order
          <font className="maincolor pl-3">#{orderId}</font>
        </h1>
      </div>
    );
  };

  const OrderPageContentSection = ({ props }) => {
    return <div className="orderPageSection">{props.children}</div>;
  };

  const ProductsSummaryTable = () => {
    return (
      <div className="productsSummary">
        <table>
          <thead>
            <tr>
              <th className="summaryHeader">Products</th>
              <th className="alignCenter">Amount</th>
              <th className="alignCenter">Price</th>
              <th className="alignCenter">Total price</th>
            </tr>
          </thead>
          <tbody>
            {clientDetails.products.map((product, idx) => {
              return (
                <tr key={idx}>
                  <td className="text-start font-semibold px-0 ">
                    {product.productName}
                  </td>
                  <td className="alignCenter">x{product.amount}</td>
                  <td className="alignCenter">${product.itemPrice}</td>
                  <td className="alignCenter">${product.totalPrice}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const OrderDetailsSection = () => {
    return (
      <div className="orderDetails">
        <div className="orderDetailsRow">
          <h3 className="summaryHeader">Client info</h3>
        </div>
        <div className="orderDetailsRow">
          <div className="orderDetailsLeft">Client name</div>
          <div className="orderDetailsRight">{clientDetails.clientName}</div>
        </div>
        <div className="orderDetailsRow">
          <div className="orderDetailsLeft">Phone number</div>
          <div className="orderDetailsRight">{clientDetails.phone}</div>
        </div>
        <div className="orderDetailsRow">
          <div className="orderDetailsLeft">Additional info</div>
          <div className="orderDetailsRight">{clientDetails.clientDetails}</div>
        </div>
      </div>
    );
  };

  const UserColumnSection = () => {
    return (
      <div className="userColumn">
        <h3 className="summaryHeader">Added by:</h3>
        <div className="userColumnRow">
          <div className="orderDetailsLeft">
            <p className="userInfo">{clientDetails.workerName}</p>
          </div>
          <div className="orderDetailsRight">
            <button
              className="editOrderButton"
              onClick={() => {
                setButtonPopup(true);
                setDeletedItems({ ids: [] });
              }}
            >
              <EditRoundedIcon />
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  };

  const OrderSummarySection = () => {
    return (
      <div className="orderSummary orderDetails">
        <div className="orderDetailsRow">
          <div className="orderDetailsLeft">
            <h3 className="summaryHeader">Summary</h3>
          </div>
          <div className="orderDetailsRight">
            <span className={`orderStatusSummary`}>{clientDetails.status}</span>
          </div>
        </div>
        <div className="orderDetailsRow">
          <div className="orderDetailsLeft">Date</div>
          <div className="orderDetailsRight">
            {supplementary.date.split("T")[0]}
          </div>
        </div>
        <div className="orderDetailsRow">
          <div className="orderDetailsLeft">Total price</div>
          <div className="orderDetailsRight">${supplementary.total}</div>
        </div>
      </div>
    );
  };

  const OrderShippmentSection = () => {
    return (
      <div className="orderDetails ">
        <h3 className="summaryHeader">Shippment address </h3>
        <div className="orderDetailsRow space-x-2 flex">
          <font className="bold">Country: </font>
          <p>{clientDetails.country}</p>
        </div>
        <div className="orderDetailsRow space-x-2 flex">
          <font className="bold">City: </font>
          <p>{clientDetails.city}</p>
        </div>
        <div className="orderDetailsRow space-x-2 flex">
          <font className="bold">Postal code: </font>
          <p>{clientDetails.postalCode}</p>
        </div>
        <div className="orderDetailsRow space-x-2 flex">
          <font className="bold">Street, house number: </font>
          <p>{clientDetails.street}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bodyWrap">
      <div className="orderPageContentWrap">
        <OrderPageHeaderSection />
        <div className="orderPageSection py-2 relative box-border ">
          <div className="orderPageLeftSide">
            <ProductsSummaryTable />
            <OrderDetailsSection />
          </div>

          <div className="orderPageRightSide overflow-y-scroll scrollbar-hide">
            <UserColumnSection />
            <OrderSummarySection />
            <OrderShippmentSection />
          </div>
        </div>
      </div>

      <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
        <div className="popupWrap ">
          <h3>
            Edit order
            <font className="maincolor bold pl-3">#{orderId}</font>
          </h3>
          <div className="addNewOrderWrap">
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
                    required="required"
                  />
                  <input
                    type="text"
                    placeholder="Street, home number"
                    className="orderDetailsInput orderDetailsInputHalf"
                    value={clientDetails.street}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        street: e.target.value,
                      })
                    }
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
                    required="required"
                  />
                </div>
                <div className="input-group">
                  <select
                    className="orderDetailsSelect"
                    placeholder="Pick status"
                    value={clientDetails.status}
                    onChange={(e) =>
                      setClientDetails({
                        ...clientDetails,
                        status: e.target.value,
                      })
                    }
                    required="required"
                  >
                    <option value="paid">paid</option>
                    <option value="pending">pending</option>
                    <option value="shipped">Shipped</option>
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
                              onClick={() => {
                                removeProduct(index);
                                setDeletedItems((prev)=>{
                                  return{ids: [...prev.ids, product.id]}
                                })
                              }}
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
                  Total price of products -{" "}
                  {clientDetails.products?.reduce(
                    (a, b) => a + (b.itemPrice * b.amount || 0),
                    0
                  )}
                  $
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
                  updateOrder();
                  // setClientDetails({
                  //   clientName: "",
                  //   clientDetails: "",
                  //   phone: "",
                  //   country: "",
                  //   street: "",
                  //   city: "",
                  //   postalCode: "",
                  //   status: "",
                  //   products: [],
                  //   workerName: "",
                  // });
                  // setProductDetails({
                  //   productName: "",
                  //   amount: 1,
                  //   itemPrice: 0,
                  //   totalPrice: 0,
                  // });
                }}
              >
                <span className="addOrderText">Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </Popup>
    </div>
  );
}

export default OrderPage;
