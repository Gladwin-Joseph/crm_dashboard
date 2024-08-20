import React, { useState, useEffect } from 'react';
import '../Login.css'

const Dropdown = () => {
    const [champions, setChampions] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/userdata") 
          .then(response => response.json())
          .then(data => {
            const extractedNames = data.result7.map(item => item["CreatedBy"]);
            const uniqueNames = [...new Set(extractedNames)];
            setChampions(uniqueNames);
          })
          .catch(error => console.error(error));
      }, []);
  return (
    <label>
                <select id="role">
                  <option value="">Champions</option>
                  {champions.map((champion,index) => (
                    <option key={index} value={champion}> 
                        {champion}
                    </option>
                  ))}
                </select>
             </label>  
  )
}

export default Dropdown