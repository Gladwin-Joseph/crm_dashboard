import React, { useEffect, useState } from "react";
import "./Table.css";

const QuoteTdy = () => {
  const [users, setUsers] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(20000);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:5000/api/userdata")
        .then((response) => response.json())
        .then((users) => {
          setUsers(users); // Set the users in your state
          console.log(users);
          setIsLoading(false); // Log the fetched data to the console
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
          <th>Quote ID</th>
          <th>Branch Name</th>
          <th>User</th>
          <th>Quote Status</th>
        </tr>
      </thead>
      <tbody>
      {isLoading ? (
        <tr>
          <td className="heading" colSpan={4}>
            Loading...
          </td>
        </tr>
      ) : users.result2?.length > 0 ? (
        users.result2.map((user, index) => (
          <tr key={index}>
            <td>{user["ID"]}</td>
            <td>{user["SalesOfficeName"]}</td>
            <td>{user["CreatedBy"]}</td>
            <td>{user["ResultStatusCodeText"]}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td className="heading" colSpan={4}>
            Nothing is here.
          </td>
        </tr>
      )}
      </tbody>
    </table>
  );
};

export default QuoteTdy;