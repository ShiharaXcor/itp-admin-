import axios from "axios";
import React, { useState } from "react";
import { backendUrl } from "../App";

const Login = ({setToken}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {


        e.preventDefault();
        const response = await axios.post(backendUrl + '/api/user/admin',{email,password})
        console.log(response);


        if(response.data.success){
            setToken(response.data.token)
        }
    
        
    
    
    
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">Admin Panel</h1>
        
        <form onSubmit={onSubmitHandler} className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-2">Email</label>
            <input type="email" value={email}  onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
        
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-2">Password</label>
            
            <input type="password"  value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
         
         
          </div>

          <button type="submit"className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300'> Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
