import React, { useEffect, useState } from "react";
import "./Table.css";

const StockYest = () => {
  const [users, setUsers] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(20000);
  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:5000/api/userdata")
        .then((response) => response.json())
        .then((users) => {
          setUsers(users); // Set the users in your state
          console.log(users); // Log the fetched data to the console
        })
        .catch((error) => console.error(error));
    };
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);
  return (
    <table>
      <thead>
        <tr>
          <th>Branch Name</th>
          <th>User</th>
          <th>Stock Transfer Status</th>
        </tr>
      </thead>
      <tbody>
        {users.result6?.map((user, index) => (
          <tr key={index}>
            <td>{user["SalesUnitName"]}</td>
            <td>{user["CreatedBy"]}</td>
            <td>{user["UserStatusCodeText"]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StockYest;
