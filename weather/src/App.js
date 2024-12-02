import React from 'react';
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Privacy from './componets/Privacy';
import Home from './componets/Fetchin';

function App() {
    return (
      <Router>
      <div>
        <nav style={{ 
          display: 'flex', 
          flexWrap:'wrap',
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'gray', 
          padding: '10px' 
        }}>
          <Link to="/" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            padding: '10px', 
            margin: '0 15px', 
            fontSize: '18px' 
          }}>Home</Link>
          <Link to="/privacy" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            padding: '10px', 
            margin: '0 15px', 
            fontSize: '18px' 
          }}>Privacy Policy</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </div>
    </Router>
    
    );
}

export default App;
