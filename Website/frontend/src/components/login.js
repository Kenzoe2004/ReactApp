import React, { useContext, useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const token = sessionStorage.getItem("token");
  console.log("This is your token",token)

  useEffect(() => {
    if (token) {
      // If token is present, redirect to home page
      navigate('/');
    }
  }, [token, navigate]);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = async () => {
    const opts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    };
  
    try {
      const resp = await fetch('http://127.0.0.1:5000/token', opts);
      const data = await resp.json();
  
      if (resp.status !== 200) {
        if (resp.status === 404) {
          setErrorMessage('User does not exist. Please sign up.'); // Display user not found message
        } else if (resp.status === 401) {
          setErrorMessage('Invalid credentials. Please check your username and password.'); // Display invalid credentials message
        } else {
          setErrorMessage('Error logging in'); // Display generic error message for other errors
        }
        return;
      }
      
      console.log('This came from the backend', data);
      sessionStorage.setItem('token', data.access_token);
      sessionStorage.setItem('user', data.user1);
      sessionStorage.setItem('userId', data.userId);
  
      console.log(data.user1);
      navigate('/'); // Redirect to the App component after successful login
    } catch (error) {
      console.error('There has been an error logging in');
      setErrorMessage('Error logging in');
    }
  };
  const handleSwitch = () => {
    navigate('/signup'); // Navigate to the login page
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="col-md-4">
        <h2>Login</h2>
        {(token && token !="" && token!=undefined) ? "you are logged in with this token" + token:

        <div>
          <div className="mb-3">
          <label className="form-label">Username:</label>
          <input type="text" className="form-control" value={username} onChange={handleUsernameChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Password:</label>
          <input type="password" className="form-control" value={password} onChange={handlePasswordChange} />
        </div>
        <button className="btn btn-success" onClick={handleLogin}>Login</button>
        <button className="btn btn-success" onClick={handleSwitch}>
              Sign up
        </button>
        {errorMessage && <p>{errorMessage}</p>}
        </div>
        }
        
      </div>
    </div>
  );
};

export default Login;