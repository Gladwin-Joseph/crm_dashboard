import React, { useEffect, useState } from "react";
import "./Table.css";
const VisitYest = () => {
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
          <th>Visit ID</th>
          <th>Branch Name</th>
          <th>User</th>
          <th>Visit Status</th>
        </tr>
      </thead>
      <tbody>
      {isLoading ? (
        <tr>
          <td className="heading" colSpan={4}>
            Loading...
          </td>
        </tr>
      ) : users.result10?.length > 0 ? (
        users.result10.map((user, index) => (
          <tr key={index}>
            <td>{user["ID"]}</td>
            <td>{user["SalesTerritoryName"]}</td>
            <td>{user["FormattedName"]}</td>
            <td>{user["StatusText"]}</td>
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

export default VisitYest;