import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Styles/homepage.css";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SupervisorAccountRoundedIcon from "@mui/icons-material/SupervisorAccountRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import ContentPasteRoundedIcon from "@mui/icons-material/ContentPasteRounded";

function Homepage() {
  const [dashboardData, setDashboardData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get("http://localhost:5000/dashboard_data", {
        withCredentials: true,
      });
      if (result.data) {
        setDashboardData({ ...result.data });
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // console.log("Updated dashboardData:", dashboardData); // ✅ Logs AFTER state updates
  }, [dashboardData]);

  const TopPanel = () => {
    const todaysDate = new Date().getTime();
    const historyDateRange = (days) => {
      let newDate = new Date();
      newDate.setHours(0, 0, 0, 1);
      newDate.setDate(newDate.getDate() - days);
      return newDate.getTime();
    };
    const [changedDate, setChangedDate] = useState(historyDateRange(0));
    const [selectedDateToText, setSelectedDateToText] = useState("today");

    const calendarDataFiltered = dashboardData?.calendar?.filter((item) => {
      const dateItem = item.deadlinedate.split("T")[0];
      const dateToCompare = new Date(dateItem).getTime();
      return changedDate < dateToCompare 
    });
    const orderDataFiltered = dashboardData?.order?.filter((item) => {
      const dateItem = item.date.split("T")[0];
      const dateToCompare = new Date(dateItem).getTime();
      return changedDate < dateToCompare && dateToCompare < todaysDate;
    });

    const clientDataFiletered = dashboardData?.client?.filter((client)=>{
      const dateItem = client.clientdatecreated.split("T")[0];
      const dateToCompare = new Date(dateItem).getTime();
      return changedDate < dateToCompare && dateToCompare < todaysDate;
    });

    const getTotalClient = () =>{
      if (!clientDataFiletered?.length) return 0;
      return clientDataFiletered?.length
    }
    const getTotalSumOfRange = () => {
      if (!orderDataFiltered?.length) return 0;
      const totalPriceFiltered = orderDataFiltered.reduce((total, item) => {
        return total + Number(item.price);
      }, 0);
      return totalPriceFiltered.toFixed(2);
    };

    const getTotalOrderOfDateRange = () => {
      if (!orderDataFiltered?.length) return 0;
      return orderDataFiltered?.length;
    };

    const getTotalCalendarOfDateRange = () => {
      if (!calendarDataFiltered?.length) return 0;
      return calendarDataFiltered?.length;
    };

    const dateRangeToText = (dateNumber) => {
      if (dateNumber === 0) {
        setSelectedDateToText("today");
      } else if (dateNumber > 100) {
        setSelectedDateToText("whole period");
      } else {
        setSelectedDateToText(`${dateNumber} days`);
      }
    };

    const upcomingEventDateText = (date) => {
      let todaysDate = new Date().toISOString().split("T")[0];
      let tommorowDate = new Date();
      tommorowDate.setDate(tommorowDate.getDate() + 1);
      let tommorowDateToCompare = tommorowDate.toISOString().split("T")[0];
      let eventDate = date.split("T")[0];
      if (eventDate === todaysDate) {
        return "Today";
      } else if (eventDate === tommorowDateToCompare) {
        return "Tommorow";
      } else {
        return eventDate;
      }
    };

    const UpcomingEvents = () => {
      let upcomingEventsExist = false;
      if (
        dashboardData?.calendar === undefined ||
        dashboardData?.calendar.length === 0
      ) {
        upcomingEventsExist = false;
      } else {
        upcomingEventsExist = true;
      }
      return upcomingEventsExist ? (
        calendarDataFiltered?.slice(0, 1).map((event) => {
          let dateText = upcomingEventDateText(event.deadlinedate);
          const hours = event.hours.split('.')[0]
          return (
            <div className="upcomingEventWrap" key={event.id}>
              <div className="upcomingEventDate">
                <span className="block">-{dateText} </span>
                <span className="ml-1">{hours}</span>
              </div>
              <div className="upcomingEventTitle">
                <span>{event.title}</span>
              </div>
            </div>
          );
        })
      ) : (
        <div className="upcomingEventWrap">
          <span>There are no upcoming events</span>
        </div>
      );
    };

    return (
      <div className="topPanelWrap">
        <div className="topPanelDataRangeBox">
          <h3>Show data from selected period</h3>
          <div className="topPanelDataIcon">
            <EventNoteRoundedIcon />
          </div>
          <select
            className="dataRangeSelect"
            onChange={(e) => {
              setChangedDate(historyDateRange(Number(e.target.value)));
              dateRangeToText(Number(e.target.value));
            }}
          >
            <option defaultValue="defaultValue" value="0">
              Today
            </option>
            <option value="7">7 Days</option>
            <option value="14">14 Days</option>
            <option value="30">30 Days</option>
            <option value="99999">All</option>
          </select>
        </div>

        <div className="topPanelData">
          <div className="topPanelDataBox">
            <div className="topPanelDataIcon">
              <PaymentsRoundedIcon />
            </div>

            <div className="topPanelDataSummary">
              <p>Income</p>
              <h3 className="maincolor topPanelDataText">
                {getTotalSumOfRange()}$
              </h3>
            </div>

            <div className="topPanelSeperator"></div>
            <div>
              <span className="topPanelBottomText">
                From {selectedDateToText}
              </span>
            </div>
          </div>

          <div className="topPanelDataBox">
            <div className="topPanelDataIcon">
              <TrendingUpRoundedIcon />
            </div>

            <div className="topPanelDataSummary">
              <p>New orders</p>
              <h3 className="maincolor topPanelDataText">
                {getTotalOrderOfDateRange()}
              </h3>
            </div>

            <div className="topPanelSeperator"></div>
            <div>
              <span className="topPanelBottomText">
                <Link to="/orders" className="maincolor">
                  + Create new order
                </Link>
              </span>
            </div>
          </div>

          <div className="topPanelDataBox">
            <div className="topPanelDataIcon">
              <SupervisorAccountRoundedIcon />
            </div>

            <div className="topPanelDataSummary">
              <p>New clients</p>
              <h3 className="maincolor topPanelDataText">{getTotalClient()} </h3>
            </div>

            <div className="topPanelSeperator"></div>
            <div>
              <span className="topPanelBottomText">
                <Link to="/clients" className="maincolor">
                  + Add new client
                </Link>
              </span>
            </div>
          </div>

          <div className="topPanelDataBox">
            <div className="topPanelDataIcon topPanelHeaderInline">
              <ContentPasteRoundedIcon />
              <span>Upcoming events : {getTotalCalendarOfDateRange()}</span>
            </div>

            <UpcomingEvents />

            <div className="topPanelSeperator"></div>

            <div>
              {getTotalCalendarOfDateRange() > 1 && (
                <span className="topPanelBottomText">
                  <Link to="/calendar" className="maincolor">
                    See more events
                  </Link>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ChartComponent = () => {
    const getPastMonths = () => {
      const pastMonths = [];
      for (let i = 0; i < 12; i++) {
        const todaysDate = new Date();
        todaysDate.setMonth(todaysDate.getMonth() - i);
        pastMonths.push({
          month: todaysDate.toLocaleString("default", { month: "long" }),
          firstDay: new Date(
            todaysDate.getFullYear(),
            todaysDate.getMonth(),
            1
          ),
          lastDay: new Date(
            todaysDate.getFullYear(),
            todaysDate.getMonth() + 1,
            0
          ),
          totalMonthSum: 0,
        });
      }
      return pastMonths;
    };
    const dataBasedOnPastMonths = () => {
      const pastMonthsData = getPastMonths();
      pastMonthsData.forEach((el, i) => {
        el.totalMonthSum = dashboardData?.order?.reduce((total, item) => {
          let itemDate = new Date(item.date);
          if (
            el.firstDay.getTime() < itemDate.getTime() &&
            itemDate.getTime() < el.lastDay.getTime()
          ) {
            return total + Number(item.price);
          } else {
            return total;
          }
        }, 0);
      });
      return pastMonthsData.reverse();
    };

    return (
      <ResponsiveContainer width="100%" height="50%">
        <LineChart
          width={500}
          height={300}
          data={dataBasedOnPastMonths()}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalMonthSum"
            stroke="#8884d8"
            name="Orders sum"
            activeDot={{
              r: 8,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bodyWrap dashboardPage">
      <TopPanel />
      <ChartComponent />
    </div>
  );
}

export default Homepage;
