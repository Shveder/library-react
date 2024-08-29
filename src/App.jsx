import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Authorization from './Components/screens/authorization/Authorization'
import Registration from './Components/screens/registration/Registration'


const App = () => {
  return <BrowserRouter>
    <Routes>
        <Route element={<Authorization />} path='/authorization' />
        <Route element={<Registration />} path='/registration' />
        <Route path="/" element={<Navigate to="/authorization" replace />} />
        <Route path='*' element={<div>Not found</div>} />

    </Routes>

  </BrowserRouter>
  /*<AuthProvider>*/
}

export default App;