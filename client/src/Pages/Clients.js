import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Styles/clients.css";
import { AuthLoginInfo } from "./../AuthComponents/AuthLogin";
import Popup from "../Components/Popup";
import SearchBar from "../Components/SearchBar";
import Pagination from "../Components/Pagination";
import ReadMoreRoundedIcon from "@mui/icons-material/ReadMoreRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";

function Clients() {
  const ctx = useContext(AuthLoginInfo);
  const [newOrderSubmitted, setNewOrderSubmitted] = useState(false);
  const [clientsData, setClientsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [buttonPopup, setButtonPopup] = useState(false);
  const [filterId, setFilterId] = useState("");
  useEffect(() => {
    const fetchClient = async () => {
      const result = await axios.get(
        "https://one-place-clone.onrender.com/clients"
      );
      setClientsData(result.data);
      setFilteredData(result.data);
    };
    fetchClient();
  }, []);

  useEffect(() => {}, [filteredData]);
  const handleSearchChange = (newFilteredData) => {
    setFilteredData(newFilteredData);
  };

  const ClientsTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;
    const totalClients = filteredData.length;
    const computedClients = filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      (currentPage - 1) * itemsPerPage + itemsPerPage
    );
    const computedClientsLength = computedClients.length;

    return (
      <>
        <div className="tableResultsWrap">
          <div className="resultsSpan">
            Showing
            <font className="resultsBold"> {computedClientsLength} </font>
            of
            <font className="resultsBold"> {totalClients} </font>
            results
          </div>
          <Pagination
            total={totalClients}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>Client ID</th>
              <th>Client name</th>
              <th>Phone</th>
              <th>City</th>
              <th>Orders count</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {computedClients.map((client, i) => {
              return (
                <tr key={i}>
                  <td>
                    <font className="maincolor">#</font>
                    {client.client_id}
                  </td>
                  <td>{client.client}</td>
                  <td>{client.phone}</td>
                  <td>{client.city}</td>
                  <td>{client.order_count ? client.order_count : "0"}</td>
                  <td className="maincolor">
                    <Link to={`/clients/${client.client_id}`}>
                      <ReadMoreRoundedIcon />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  };

  const AddClients = () => {
    const [clientDetails, setClientDetails] = useState({
      clientName: "",
      clientDetails: "",
      phone: "",
      country: "",
      street: "",
      city: "",
      postalCode: "",
      workerName: ctx.username,
    });
    const createNewClient = async () => {
      try {
        const response = axios.post(
          "https://one-place-clone.onrender.com/new_client",
          { clientDetails, account_id: ctx.id },
          { withCredentials: true }
        );
      } catch (error) {
        console.error("Error creating client", error);
      }
    };

    return (
      <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
        <div className="popupWrap">
          <div className="productsSummary">
            <h3 className="productSummaryLeft">Add new client</h3>
          </div>

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
                    placeholder="Client details"
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
                    placeholder="Street, home/appartment number"
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
              </div>
            </div>
          </div>

          <div className="submitWrap">
            <div className="submitNewOrder">
              <button className="submitNewOrderBtn">
                <AddCircleOutlineRoundedIcon />
                <span
                  className="addOrderText"
                  onClick={() => {
                    createNewClient();
                    setClientDetails({
                      clientName: "",
                      clientDetails: "",
                      phone: "",
                      country: "",
                      street: "",
                      city: "",
                      postalCode: "",
                      workerName: ctx.username,
                    });
                  }}
                >
                  Add
                </span>
              </button>
            </div>
          </div>
        </div>
      </Popup>
    );
  };

  return (
    <div className="bodyWrap">
      <div className="contentOrderWrap clientsTableWrap">
        <div className="leftSide">
          <h1>Clients</h1>
          <div className="orderNavWrap">
            <div className="addOrderWrap">
              <SearchBar
                data={clientsData}
                filters="buyer"
                handleSearchChange={handleSearchChange}
                dataType="clients"
              />
              <button
                className="addOrder"
                onClick={() => {
                  setButtonPopup(true);
                }}
              >
                <AddCircleOutlineRoundedIcon />
                <span className="addOrderText">Add</span>
              </button>
            </div>
          </div>
          <div className="orderWrap">
            <ClientsTable />
          </div>
        </div>
      </div>

      <AddClients />
    </div>
  );
}

export default Clients;
