/*The Login Logic Hook

This file is a custom hook that handles all the logic of calling the login API. 
It keeps the Login page component clean by separating the logic from the UI.

What is a Custom Hook?
A custom hook is just a reusable function that contains logic.
Instead of writing the fetch/API call inside the Login page component directly, 
it's moved here so it can be reused anywhere.
*/
import { useState } from 'react';
//After a successful API call, this will be used to save the token and user data.
import { message } from 'antd';
import { useAuth } from './authContext';

const useLogin = () => {
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  const loginUser = async (values) => {
    try {
      setError(null);
      setLoading(true);
      // Before the API call — clear any old errors and set loading to true so the UI can show a spinner.
      const res = await fetch(`http://localhost:8080/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        //All above Sends a POST request to your backend in string form 
      });

      const data = await res.json();
      // Converts the backend's response from a string into a JavaScript object.
      console.log("API Response Status:", res.status); 
        console.log("API Response Data:", data);      

        message.destroy();
  if (data.success === true && data.token) {
      message.success(data.message || "Login Successful"); //pop up notfication
      login(data.token, data.user);
    } else {
      message.error("Wrong Username or Password");
    }
  } catch (error) {
    message.destroy();
    message.error("Login Failed");
    console.error("Login Error:", error);
  } finally {
    setLoading(false);
  }
};

  return { loading, error, loginUser };
};

export default useLogin;
