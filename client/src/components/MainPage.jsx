import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

const MainPage =  () => {
  const [data,setData]= useState(null);
  const [refreshInterval,setRefreshInterval] = useState(20000);
  useEffect(() => {
   const fetchData= () => {fetch('https://crm-dashboard-y946.onrender.com/api/data') 
     .then(response => response.json())
     .then(data => setData(data))
     .catch(error => console.error('Error:',error))}
     fetchData();
     
     const interval= setInterval(fetchData,refreshInterval);

     return() => clearInterval(interval)
  }, [refreshInterval]);    

  
  return (
    <div className="main-page">
    <h3 className='quotes'>Quotes</h3>
    <Link to={`/quoteactivity`}>
      <button className='quotebtn'>
          See Champion activity
      </button>
    </Link>
    <div className="container">
      <Link to={`/userdata`} className="card">
        <h4 className="text">Total Quote released -MTD</h4>
        <h2 className="numbers">{data?.data1}</h2>
      </Link>
      <Link to={`/quotetdy`} className="card">
        <h4 className="text">Total Quote released Today</h4>
        <h2 className="numbers">{data?.data2}</h2>
      </Link>
      <Link to={`/quoteyest`} className="card">
        <h4 className="text">Total Quote released Yesterday</h4>
        <h2 className="numbers">{data?.data3}</h2>
      </Link>
    </div>
    <h3>Stock Transfer</h3>
    <div className="container">
      <Link to={`/stockmonthly`} className="card">
        <h4 className="text">ST Released-Monthly</h4>
        <h2 className="numbers">{data?.data8}</h2>
      </Link>

      <Link to={`/stocktdy`} className="card">
        <h4 className="text">ST Released-Today</h4>
        <h2 className="numbers">{data?.data9}</h2>
      </Link>

      <Link to={`/stockyest`} className="card">
        <h4 className="text">ST Released-Yesterday</h4>
        <h2 className="numbers">{data?.data10}</h2>
      </Link>
    </div>

    <h3>Visits</h3>
    <div className="container">
      <Link to={`/visitlastmonth`} className="card">
        <h4 className="text">Last Month Visits(Completed)</h4>
        <h2 className="numbers">{data?.data4}</h2>
      </Link>

      <Link to={`/visitmonthly`} className="card">
        <h4 className="text">Current Month Visits(Completed)</h4>
        <h2 className="numbers">{data?.data5}</h2>
      </Link>

      <Link to={`/visittdy`} className="card">
        <h4 className="text">Today Visits(Completed)</h4>
        <h2 className="numbers">{data?.data6}</h2>
      </Link>

      <Link to={`/visityest`} className="card">
        <h4 className="text">Yesterday Visits(Completed)</h4>
        <h2 className="numbers">{data?.data7}</h2>
      </Link>
    </div>
  </div>
);
};

export default MainPage;