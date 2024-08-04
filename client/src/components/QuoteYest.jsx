import React, { useEffect, useState } from "react";
import "./Table.css";

const QuoteYest = () => {
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
          <th>Quote Status</th>
        </tr>
      </thead>
      <tbody>
        {users.result3?.map((user, index) => (
          <tr key={index}>
            <td>{user["SalesOfficeName"]}</td>
            <td>{user["CreatedBy"]}</td>
            <td>{user["ResultStatusCodeText"]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default QuoteYest;
