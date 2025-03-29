import React, { useState, useEffect } from "react";

function SearchBar({ data, handleSearchChange, dataType, filters }) {
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (!data) return;

    const filterData = () => {
      const lowerSearch = searchInput.toLowerCase();
      let filteredData = [];

      if (dataType === "orders") {
        if (searchInput.trim() === "") {
          handleSearchChange(
            data.filter((item) => item.status === filters || filters === "")
          );
          return;
        }
      }else if (dataType === "clients") {
        if (searchInput.trim() === "") {
          handleSearchChange(
            data.filter((item) => item.clientdetails.toLowerCase() === 'buyer')
          );
          return;
        }
      }

      if (dataType === "orders") {
        filteredData = data.filter((item) =>
          [
            item.price + "",
            item.status,
            item.id,
            item.workername,
            item.client,
          ].some((r) => r?.toString().toLowerCase().includes(lowerSearch))
        );
      } else if (dataType === "clients") {
        filteredData = data.filter((item) =>
          [
            item.client,
            item.clientdetails,
            item.phone,
            item.country,
            item.city,
          ].some((r) => r?.toString().toLowerCase().includes(lowerSearch))
        );
      }

      handleSearchChange(filteredData);
    };

    filterData();
  }, [searchInput, data, dataType, filters]);

  return (
    <>
      <input
        type="text"
        placeholder="Search by name or ID"
        onChange={(e) => setSearchInput(e.target.value)}
        value={searchInput}
      />
    </>
  );
}

export default SearchBar;
