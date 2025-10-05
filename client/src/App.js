import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import BoardDetail from './pages/BoardDetail';
import EditBoard from './pages/EditBoard';
import Admin from './pages/Admin';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/board/:id" element={<BoardDetail />} />
            <Route path="/boards/:id" element={<BoardDetail />} />
            <Route path="/admin/boards/:id/edit" element={<EditBoard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
