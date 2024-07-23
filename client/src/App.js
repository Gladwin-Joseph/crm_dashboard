import Navbar from './components/Navbar';
import {Route, Routes, BrowserRouter } from 'react-router-dom';
import Login from './components/Login'
import { useEffect, useState } from 'react';


function App() {
  const [isAuthenticated,setIsAuthenticated]= useState(false);

  useEffect(() => {
    setIsAuthenticated(true)
  },[])

  return (
      <div> 
          <BrowserRouter>
            <Routes>
              <Route exact path='/home' element={<Navbar />} />
            </Routes>
            <Routes>
              <Route path='/' element={<Login /> }/>
            </Routes>
          </BrowserRouter>
      </div>
    
  );
}

export default App;