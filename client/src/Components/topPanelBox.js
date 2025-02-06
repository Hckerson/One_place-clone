
export default function TopPanelBox(props) {
  return (
    <div className="topPanelDataBox">
    <div className="topPanelDataIcon">
      <PaymentsRoundedIcon />
    </div>

    <div className="topPanelDataSummary">
      <p>Income</p>
      <h3 className="maincolor topPanelDataText">
        {getTotalSumOfDateRange()}
        zł
      </h3>
    </div>

    <div className="topPanelSeperator"></div>
    <div>
      <span className="topPanelBottomText">
        From {selectedDateToText}
      </span>
    </div>
  </div>
  )
}