import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Authorization from './Components/screens/authorization/Authorization'
import Registration from './Components/screens/registration/Registration'
import AuthProvider from './providers/AuthProvider';
import BookView from './Components/screens/bookView/BookView';
import UserMain from './Components/screens/userMain/UserMain';
import AuthorView from './Components/screens/authorView/AuthorView';
import UserProfile from './Components/screens/userProfile/UserProfile';


const App = () => {
  return <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Authorization />} path='/authorization' />
        <Route element={<Registration />} path='/registration' />
        <Route element={<UserMain />} path='/userMain' />
        <Route path='/bookView/:id' element={<BookView />} />
        <Route path='/author/:id' element={<AuthorView />} />
        <Route element={<Registration />} path='/adminMain' />
        <Route element={<UserProfile />} path='/userProfile' />
        <Route path="/" element={<Navigate to="/authorization" replace />} />
        <Route path='*' element={<div>Not found</div>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
}

export default App;