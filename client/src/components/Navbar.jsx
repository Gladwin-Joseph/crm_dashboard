import React from 'react'
import './Navbar.css'
import { IoMdSearch } from "react-icons/io";
import { RxCountdownTimer } from "react-icons/rx";
import { FaRegBell } from "react-icons/fa6";
import { VscAccount } from "react-icons/vsc";
import { SlLogout } from "react-icons/sl";
import MainPage from './MainPage';
import '../App.css'
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate= useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('loggedIn');
        navigate('/');
    }

  return (
    <>
        <nav className='navbar'>
            <a href='/'>
                <img src='../images/logo2.png' className='logo' />
            </a>
            <ul>
                <li>
                    <a href='/search'>
                        <IoMdSearch />
                    </a>

                    <a href='/productivity'>
                        <RxCountdownTimer />
                    </a>

                    <a href='/notifications'>
                        <FaRegBell />
                    </a>

                    <a href='/usermenu'>
                        <VscAccount />
                    </a>

                    <a>
                        <SlLogout onClick={handleLogout} className='logout'/>
                    </a>
                </li>
            </ul>
        </nav>
        <MainPage />
    </>
  )
}

export default Navbar