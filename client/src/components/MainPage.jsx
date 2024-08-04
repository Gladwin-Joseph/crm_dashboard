import React, { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import UserData from "./UserData";

const MainPage = () => {
  const [data, setData] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(20000);
  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:5000/api/data")
        .then((response) => response.json())
        .then((data) => setData(data))
        .catch((error) => console.error(error));
    };
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="main-page">
      <h3>Quotes</h3>
      <div className="container">
        <Link to={`/userdata`} className="card">
          <h4 className="text">Total Quote released -MTD</h4>
          <h2 className="numbers">{JSON.stringify(data?.data1)}</h2>
        </Link>
        <Link to={`/userdata`} className="card">
          <h4 className="text">Total Quote released Today</h4>
          <h2 className="numbers">{JSON.stringify(data?.data2)}</h2>
        </Link>
        <Link to={`/quoteyest`} className="card">
          <h4 className="text">Total Quote released Yesterday</h4>
          <h2 className="numbers">{JSON.stringify(data?.data3)}</h2>
        </Link>
      </div>
      <h3>Stock Transfer</h3>
      <div className="container">
        <Link to={`/userdata`} className="card">
          <h4 className="text">ST Released-Monthly</h4>
          <h2 className="numbers">{JSON.stringify(data?.data8)}</h2>
        </Link>

        <Link to={`/userdata`} className="card">
          <h4 className="text">ST Released-Today</h4>
          <h2 className="numbers">{JSON.stringify(data?.data9)}</h2>
        </Link>

        <Link to={`/userdata`} className="card">
          <h4 className="text">ST Released-Yesterday</h4>
          <h2 className="numbers">{JSON.stringify(data?.data10)}</h2>
        </Link>
      </div>

      <h3>Visits</h3>
      <div className="container">
        <Link to={`/userdata`} className="card">
          <h4 className="text">Last Month Visits(Completed)</h4>
          <h2 className="numbers">{JSON.stringify(data?.data4)}</h2>
        </Link>

        <Link to={`/userdata`} className="card">
          <h4 className="text">Current Month Visits(Completed)</h4>
          <h2 className="numbers">{JSON.stringify(data?.data5)}</h2>
        </Link>

        <Link to={`/userdata`} className="card">
          <h4 className="text">Today Visits(Completed)</h4>
          <h2 className="numbers">{JSON.stringify(data?.data6)}</h2>
        </Link>

        <Link to={`/userdata`} className="card">
          <h4 className="text">Yesterday Visits(Completed)</h4>
          <h2 className="numbers">{JSON.stringify(data?.data7)}</h2>
        </Link>
      </div>
    </div>
  );
};

export default MainPage;
