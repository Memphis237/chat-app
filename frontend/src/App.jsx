import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {Login} from './pages/Login';
import {Home} from './pages/Home';
import {Profil} from './pages/Profil';
import {Settings} from './pages/Settings';
import {ChatbotIA} from './pages/ChatbotIA';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/Home" element={<Home/>}/>
          <Route path="/Profil" element={<Profil/>}/>
          <Route path="/Settings" element={<Settings/>}/>
          <Route path="/ChatbotIA" element={<ChatbotIA/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
