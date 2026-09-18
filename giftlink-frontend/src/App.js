import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import MainPage from './components/MainPage/MainPage';
import GiftsPage from './components/GiftsPage/GiftsPage';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';
import DetailsPage from './components/DetailsPage/DetailsPage';
import SearchPage from './components/SearchPage/SearchPage';
import Profile from './components/Profile/Profile';
import AddGiftPage from './components/AddGiftPage/AddGiftPage';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/app" element={<GiftsPage />} />
        <Route path="/app/gifts" element={<GiftsPage />} />
        <Route path="/app/login" element={<LoginPage />} />
        <Route path="/app/register" element={<RegisterPage />} />
        <Route path="/app/add-gift" element={<AddGiftPage />} />
        <Route path="/app/product/:id" element={<DetailsPage />} />
        <Route path="/app/search" element={<SearchPage />} />
        <Route path="/app/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;

