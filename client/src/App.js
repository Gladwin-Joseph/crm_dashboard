import Navbar from "./components/Navbar";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Login from "./components/Login";
import { useEffect, useState } from "react";
import MainPage from "./components/MainPage";
import UserData from "./components/UserData";
import QuoteYest from "./components/QuoteYest";
import StockMonthly from "./components/StockMonthly";
import StockYest from "./components/StockYest";
import QuoteTdy from "./components/QuoteTdy";
import StockTdy from "./components/StockTdy";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(true);
  }, []);

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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
