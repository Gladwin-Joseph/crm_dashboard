import React, { useEffect, useState } from 'react'
import "./Table.css";

const DigitalClock = () => {
    const [time,setTime] = useState(new Date())

    useEffect(() => {
        const intervalId= setInterval(() => {
            setTime(new Date());
        },1000);
        return () => {
            clearInterval(intervalId)
        }
    },[]);

    function formatTime() {
        let hours= time.getHours();
        let minutes= time.getMinutes();
        let seconds= time.getSeconds();
        const meridiem= hours >=12 ? "PM" : "AM"

        hours = hours % 12 || 12;

        minutes = minutes.toString().padStart(2, "0");
        seconds = seconds.toString().padStart(2, "0");

        return `${hours}:${minutes}:${seconds} ${meridiem}`
    }

  return (
        <div className='clock'>
            <span>{formatTime()}</span>
        </div>
  )
}

export default DigitalClock