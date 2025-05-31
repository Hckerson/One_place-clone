import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./Styles/clientPage.css";
import Popup from "../Components/Popup";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ReadMoreRoundedIcon from "@mui/icons-material/ReadMoreRounded";

function ClientPage() {
  const { clientId } = useParams();
  const [clientData, setClientData] = useState({});
  const [buttonPopup, setButtonPopup] = useState(false);
  const [clientUpdated, setClientUpdated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.post(
        "http://localhost:5000/fetchClientDetails",
        { clientId },
        { withCredentials: true }
      );
      setClientData(response.data);
    };
    fetchData();
  }, [clientId]);

  useEffect(() => {
    console.log(clientData);
  }, [clientData]);

  const ClientInfo = () => {
    return (
      <div className="overflow-y-auto  h-full relative">
        <div className="clientPageHeader">
          <h1>
            Client
            <font className="maincolor">#{clientId}</font>
          </h1>
          <h3>{clientData.client && clientData.client[0]?.client}</h3>
        </div>
        <div className="clientInfo ">
          <div className="clientContactInfo">
            <span>Contant info</span>
            <div className="clientInfoGroup">
              <div className="clientInfoLabel">Email address</div>
              <div className="clientInfoText"></div>
            </div>
            <div className="clientInfoGroup">
              <div className="clientInfoLabel">Phone number</div>
              <div className="clientInfoText">
                {clientData.client && clientData.client[0]?.phone}
              </div>
            </div>
            <div className="clientInfoGroup">
              <div className="clientInfoLabel">Client details</div>
              <div className="clientInfoText">
                {clientData.client && clientData.client[0]?.clientdetails}
              </div>
            </div>
          </div>

          <div className="clientContactInfo">
            <span>Shipping info</span>
            <div className="clientInfoGroup">
              <div className="clientInfoLabel">Country</div>
              <div className="clientInfoText">
                {clientData.client && clientData.client[0]?.country}
              </div>
            </div>
            <div className="clientInfoGroup">
              <div className="clientInfoLabel">City</div>
              <div className="clientInfoText">
                {clientData.client && clientData.client[0]?.city}
              </div>
            </div>
            <div className="clientInfoGroup">
              <div className="clientInfoLabel">Postal code</div>
              <div className="clientInfoText">
                {clientData.client && clientData.client[0]?.postalcode}
              </div>
            </div>
            <div className="clientInfoGroup">
              <div className="clientInfoLabel">Street</div>
              <div className="clientInfoText">
                {clientData.client && clientData.client[0]?.street}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ClientOrders = () => {
    return (
      <div className="relative">
        <table className="w-full box-border">
          <thead className="w-full box-border">
            <tr className="flex  w-full  ">
              <th className="w-2/5 text-start">Order id</th>
              <th className="text-start flex-1">Date</th>
              <th className="text-start flex-1">Status</th>
              <th className="text-start flex-1">Price</th>
            </tr>
          </thead>
          <tbody className="w-full">
            {clientData?.order
              ?.map((order) => {
                return (
                  <tr key={order.id} className="flex  w-full">
                    <td className="w-2/5">
                      <font className="maincolor">#</font>
                      {order.id}
                    </td>
                    <td className="flex-1">{order.date.split("T")[0]}</td>
                    <td className={`${order.status} flex-1`}>{order.status}</td>
                    <td className="flex-1">$ {order.price}</td>
                    <td className="maincolor absolute -right-4     bg-red-200">
                      <Link to={`/orders/${order.id}`}>
                        <ReadMoreRoundedIcon />
                      </Link>
                    </td>
                  </tr>
                );
              })
              .reverse()}
          </tbody>
        </table>
      </div>
    );
  };
  return (
    <div className="bodyWrap">
      <div className="clientPageContentWrap">
        <div className="clientLeftWrap">
          <ClientInfo />
        </div>

        <div className="clientRightWrap">
          <div>
            <p>
              Client orders sum:
              <font className="maincolor">
                ${" "}
                {clientData?.order?.reduce((total, item) => {
                  return total + parseInt(item.price);
                }, 0)}
              </font>
            </p>
          </div>
          <ClientOrders />
        </div>
      </div>
    </div>
  );
}
export default ClientPage;
