import Navbar from './components/Navbar';
import {Route, Routes, BrowserRouter } from 'react-router-dom';
import Login from './components/Login'
import { useEffect, useState } from 'react';
import UserData from './components/UserData';
import QuoteYest from './components/QuoteYest';
import QuoteTdy from './components/QuoteTdy';
import StockMonthly from './components/StockMonthly';
import StockTdy from './components/StockTdy';
import StockYest from './components/StockYest';
import VisitLastMonth from './components/VisitLastMonth';
import VisitMonthly from './components/VisitMonthly'
import VisitTdy from './components/VisitTdy';
import VisitYest from './components/VisitYest';
import QuoteActivity from './components/QuoteActivity';
 

function App() {
  const [isAuthenticated,setIsAuthenticated]= useState(false);

  useEffect(() => {
    setIsAuthenticated(true)
  },[])

  return (
    <div>
    <BrowserRouter>
      <Routes>
        <Route exact path="/home" element={<Navbar />} />
      </Routes>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/userdata" element={<UserData />} />
        <Route path="/quoteyest" element={<QuoteYest />} />
        <Route path="/quotetdy" element={<QuoteTdy />} />
        <Route path="/stockmonthly" element={<StockMonthly />} />
        <Route path="/stocktdy" element={<StockTdy />} />
        <Route path="/stockyest" element={<StockYest />} />
        <Route path="/visitlastmonth" element={<VisitLastMonth />} />
        <Route path="/visitmonthly" element={<VisitMonthly />} />
        <Route path="/visittdy" element={<VisitTdy />} />
        <Route path="/visityest" element={<VisitYest />} />
        <Route path="/quoteactivity" element={<QuoteActivity />} />
      </Routes>
    </BrowserRouter>
  </div>
    
  );
}

export default App;