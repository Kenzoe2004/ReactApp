import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Login from './components/login';
import Sign_Up from './components/Sign_up';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes , Route } from 'react-router-dom';
import UserInfo from './components/Userinfo';
import CurrentUserSettings from './components/CurrentUserSettings';
import Form2 from './components/Form2';

ReactDOM.render(
  <BrowserRouter>
    <Routes>
        <Route index element= {<App/>}/>
        <Route path ="/home" element= {<App/>}/>
        <Route path ="/login" element= {<Login/>}/>
        <Route path ="/signup" element= {<Sign_Up/>}/>
        <Route path="/userinfo/:articleId" element={<UserInfo/>} />
        <Route path="/info" element={<CurrentUserSettings />}/>
        <Route path="/update/:articleId" element={<Form2 />} />

      
        
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);

reportWebVitals();