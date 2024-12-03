import React from 'react';
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Privacy from './componets/Privacy';
import Home from './componets/Fetchin';
import ErrorBoundary from './componets/error';



function App() {
    return (
      <ErrorBoundary>
      <Router>
      <div>
        <nav style={{ 
          display: 'flex', 
          flexWrap:'wrap',
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'gray', 
          padding: '0.6rem' 
        }}>
          <Link to="/" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            padding: '0.6rem', 
            margin: '0 0.9rem', 
            fontSize: '1.1rem' 
          }}>Home</Link>
          <Link to="/privacy" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            padding: '0.6rem', 
            margin: '0 0.9rem', 
            fontSize: '1.1rem' 
          }}>Privacy Policy</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </div>
    </Router>
    </ErrorBoundary>   
    );
}

export default App;