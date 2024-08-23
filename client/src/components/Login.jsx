import React, { useState } from 'react'
import '../Login.css'
import Image from '../login1.png'
import styles from '../Login.module.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [id,setId]= useState('');
  const [password,setPassword]= useState('');
  const [email,setEmail]= useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const roles = ['Champion', 'Admin/Director', 'Branch Head'];

  const navigate= useNavigate();

  const handleChange = (e) => {
    if (e.target.type === "number") {
      setId(e.target.value);
    } else if(e.target.type === "email"){
        setEmail(e.target.value)
    } else if(e.target.id === "role"){
      setSelectedRole(e.target.value)
    }
    else {
      setPassword(e.target.value);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const credentials = { id, password,email,selectedRole };
    console.log(credentials)

     axios.post("https://crm-dashboard-y946.onrender.com/formdata", credentials)
      .then((response) => {
        if(response.status === 200) {
          localStorage.setItem('loggedIn', 'true');
          navigate('/home')
        } else {
          alert("Login Failed")
        }
        console.log(response.status, response.data.message);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    
  }

  
  return (
      <div className={styles.root}>
       <div className='form-container'>
        <div className='form-control'> 
          <img src={Image} className='image' alt="logo"/>
          <form onSubmit={handleSubmit}>
              <input type='number' placeholder='User Id' value={id} onChange={handleChange} />
              <input type="email" placeholder='Enter Email' className='input' value={email} onChange={handleChange}/> 
              <input type="password" placeholder='Enter Password' className='input' value={password} onChange={handleChange}/>
              <label>
                <select value={selectedRole} onChange={handleChange} id="role">
                  <option value="">Please choose your Role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
             </label>               
              <button className='form-button' type='submit'>Sign In</button>
          </form>
            <p>
              <a href="#" className='text1'>Forgot Password?</a>
            </p>
          </div>
       </div>
      </div>
  )
}


export default Login