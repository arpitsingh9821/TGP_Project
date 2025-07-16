import React from 'react'
import { TbLogout } from "react-icons/tb";
import { useAuth } from '../.../../../../../context/authContext.jsx';
const DiscommDash = () => {
   const {logout} = useAuth();
     return (
       <div>
         <button className='absolute top-4 right-40 px-7 py-2 rounded-full text-white border-green-300 border-2 
                     flex items-center text-xl gap-1 bg-gradient-to-r from-green-300 to-green-600 
                     hover:border-green-100 hover:scale-110 transition-all duration-500 
                     hover:shadow-[0_0_20px_5px_rgba(134,239,172,0.8)]' onClick={logout}><TbLogout />Logout</button>Discomm Dashboard</div>
  )
}

export default DiscommDash