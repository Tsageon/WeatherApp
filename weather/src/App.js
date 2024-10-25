import React from 'react';
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Privacy from './componets/Privacy';
import Home from './componets/Fetchin';

function App() {
    return (
      <Router>
        <div>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/privacy">Privacy Policy</Link>
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
