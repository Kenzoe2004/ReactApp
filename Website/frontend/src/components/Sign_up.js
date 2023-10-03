import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/storage';

const Sign_Up = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const token = sessionStorage.getItem('token');
  console.log('This is your token', token);

  // Initialize Firebase with your config
  // Replace the following config object with your actual Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyCXWw-jpOLgtxmNV_TqhziLbr4uiDcWqi0",
    authDomain: "easy-5cd6c.firebaseapp.com",
    projectId: "easy-5cd6c",
    storageBucket: "easy-5cd6c.appspot.com",
    messagingSenderId: "194405130225",
    appId: "1:194405130225:web:5654c7bbdd7fc8ad732e50",
    measurementId: "G-2KSXZ27T5V"
  };
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const storageRef = firebase.storage().ref();

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handlePassword2Change = (event) => {
    setPassword2(event.target.value);
  };

  const handleProfilePictureChange = (event) => {
    setProfilePicture(event.target.files[0]);
  };

  const uploadProfilePicture = async () => {
    if (!profilePicture) {
      return null;
    }

    const fileRef = storageRef.child(`profile_pictures/${profilePicture.name}`);
    const uploadTask = fileRef.put(profilePicture);

    try {
      await uploadTask;
      const url = await fileRef.getDownloadURL();
      return url;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return null;
    }
  };

  const handleSignup = async () => {
    if (password !== password2) {
      setErrorMessage("Passwords don't match");
      return;
    }

    const profilePictureUrl = await uploadProfilePicture();

    const payload = {
      username,
      password,
      profile_picture: profilePictureUrl,
    };

    const opts = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    try {
      const resp = await fetch('http://127.0.0.1:5000/signup', opts);
      const data = await resp.json();

      if (resp.status == 409) {
        setErrorMessage(data.message);
      } else if (resp.status == 200) {
        console.log('Signup successful!');
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('user', data.user1);
        sessionStorage.setItem('userId', data.userId);
        navigate('/');
      }
    } catch (error) {
      console.error('There has been an error signing up');
      setErrorMessage('Error signing up');
    }
  };

  const handleSwitch = () => {
    navigate('/login'); // Navigate to the login page
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="col-md-4">
        <h2>Login</h2>
        {token && token !== '' && token !== undefined ? (
          "you are logged in with this token" + token
        ) : (
          <div>
            <div className="mb-3">
              <label className="form-label">Username:</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={handleUsernameChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password:</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password Confirmation:</label>
              <input
                type="password"
                className="form-control"
                value={password2}
                onChange={handlePassword2Change}
              />
              {password !== password2 && password2 !== '' && <p>Passwords don't match</p>}
            </div>
            <div className="mb-3">
              <form enctype="multipart/form-data" ><label className="form-label">Profile Picture:</label>
              <input type="file"   onChange={handleProfilePictureChange} /></form>
            </div>
            <button className="btn btn-success" onClick={handleSignup}>
              Sign Up
            </button>
            <button className="btn btn-success" onClick={handleSwitch}>
              Login
            </button>
            {errorMessage && <p>{errorMessage}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sign_Up;
